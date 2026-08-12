#[cfg(target_os = "macos")]
pub mod macos {
    use std::ffi::{c_char, c_void, CStr, CString};
    use std::sync::{Arc, LazyLock, Mutex, mpsc};
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::collections::HashMap;
    use std::time::{Duration, Instant};
    use tauri::{AppHandle, Emitter, Manager};
    use serde::Serialize;

    // ── Inline Pro State types ──────────────────────────────────────────────
    use std::path::PathBuf;
    use serde::Deserialize;

    #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "lowercase")]
    pub enum ProMode { Free, Trial, Paid }

    impl Default for ProMode { fn default() -> Self { ProMode::Free } }

    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum UiState { Free, TrialActive, TrialExhausted, Paid }

    const TRIAL_CREDIT_LIMIT: i32 = 25;
    fn default_trial_credits() -> i32 { TRIAL_CREDIT_LIMIT }
    fn legacy_trial_credit_limit() -> i32 { 5 }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct ProState {
        #[serde(default)] pub mode: ProMode,
        #[serde(default = "default_trial_credits")] pub trial_credits_remaining: i32,
        #[serde(default)] pub trial_started: bool,
        #[serde(default)] pub inline_fix_enabled: bool,
        #[serde(default = "legacy_trial_credit_limit")] pub trial_credit_limit: i32,
    }

    impl Default for ProState {
        fn default() -> Self {
            ProState { mode: ProMode::Free, trial_credits_remaining: TRIAL_CREDIT_LIMIT, trial_started: false, inline_fix_enabled: false, trial_credit_limit: TRIAL_CREDIT_LIMIT }
        }
    }

    impl ProState {
        pub fn ui_state(&self) -> UiState {
            match self.mode {
                ProMode::Paid => UiState::Paid,
                ProMode::Trial if self.trial_credits_remaining > 0 => UiState::TrialActive,
                ProMode::Trial => UiState::TrialExhausted,
                ProMode::Free => UiState::Free,
            }
        }
        pub fn can_attempt_inline_fix(&self) -> bool {
            self.inline_fix_enabled && matches!(self.ui_state(), UiState::TrialActive | UiState::Paid)
        }
        fn state_file_path(app: &AppHandle) -> Option<PathBuf> {
            app.path().app_config_dir().ok().map(|mut p| { p.push("pro_state.json"); p })
        }
        pub fn load(app: &AppHandle) -> Self {
            let Some(path) = Self::state_file_path(app) else { return Self::default(); };
            if !path.exists() { return Self::default(); }
            match std::fs::read_to_string(&path) {
                Ok(json) => {
                    let mut state: Self = serde_json::from_str(&json).unwrap_or_else(|e| {
                        eprintln!("[KeyFixer ProState] Parse error: {e}; using defaults"); Self::default()
                    });
                    if state.mode == ProMode::Trial && state.trial_credit_limit < TRIAL_CREDIT_LIMIT {
                        state.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
                        state.trial_credit_limit = TRIAL_CREDIT_LIMIT;
                    }
                    state
                },
                Err(e) => { eprintln!("[KeyFixer ProState] Read error: {e}"); Self::default() }
            }
        }
        pub fn save(&self, app: &AppHandle) {
            let Some(path) = Self::state_file_path(app) else { return; };
            if let Some(p) = path.parent() { let _ = std::fs::create_dir_all(p); }
            if let Ok(json) = serde_json::to_string_pretty(self) {
                let tmp = path.with_extension("json.tmp");
                if std::fs::write(&tmp, &json).is_ok() { let _ = std::fs::rename(&tmp, &path); }
            }
        }
    }

    #[derive(Debug, Clone, Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct ProStateDto {
        pub mode: String,
        pub ui_state: String,
        pub trial_credits_remaining: i32,
        pub trial_started: bool,
        pub inline_fix_enabled: bool,
    }

    impl From<&ProState> for ProStateDto {
        fn from(s: &ProState) -> Self {
            let ui = match s.ui_state() {
                UiState::Free           => "FREE",
                UiState::TrialActive    => "TRIAL_ACTIVE",
                UiState::TrialExhausted => "TRIAL_EXHAUSTED",
                UiState::Paid           => "PAID",
            };
            ProStateDto {
                mode: match s.mode { ProMode::Free=>"free", ProMode::Trial=>"trial", ProMode::Paid=>"paid" }.to_string(),
                ui_state: ui.to_string(),
                trial_credits_remaining: s.trial_credits_remaining,
                trial_started: s.trial_started,
                inline_fix_enabled: s.inline_fix_enabled,
            }
        }
    }

    const TAG: &str = "[KeyFixer InlineFix]";
    const VK_ANSI_C: u16 = 0x08;
    const VK_ANSI_V: u16 = 0x09;
    const CG_EVENT_FLAG_COMMAND: u64 = 0x0010_0000;
    const CG_EVENT_FLAG_ALTERNATE: u64 = 0x0008_0000;
    const CG_EVENT_SOURCE_STATE_COMBINED_SESSION: i32 = 0;
    const CG_EVENT_SOURCE_STATE_HID_SYSTEM: i32 = 1;
    const MODIFIER_RELEASE_TIMEOUT: Duration = Duration::from_millis(2_000);
    const MODIFIER_SETTLE_TIME: Duration = Duration::from_millis(30);
    const CONVERSION_TIMEOUT: Duration = Duration::from_millis(1_500);

    pub type SharedProState = Arc<Mutex<ProState>>;

    pub static PRO_STATE: LazyLock<Mutex<Option<SharedProState>>> =
        LazyLock::new(|| Mutex::new(None));

    pub fn get_shared_state() -> Option<SharedProState> {
        PRO_STATE.lock().ok()?.clone()
    }

    #[derive(Debug)]
    enum InlineFixResult {
        Success { _converted_len: usize },
        NoSelection,
        ModifierReleaseTimeout,
        CopyKeystrokeFailed,
        ClipboardReadFailed,
        ConversionFailed,
        TargetChanged,
        PasteWriteFailed,
        PasteKeystrokeFailed,
        AlreadyCorrect,
        SelfFrontmost,
    }

    impl InlineFixResult {
        fn is_success(&self) -> bool {
            matches!(self, InlineFixResult::Success { .. })
        }
    }


    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        fn CGPreflightPostEventAccess() -> bool;
        fn CGRequestPostEventAccess() -> bool;
        fn CGEventSourceCreate(stateID: i32) -> *mut c_void;
        fn CGEventCreateKeyboardEvent(source: *mut c_void, virtual_key: u16, key_down: bool) -> *mut c_void;
        fn CGEventSetFlags(event: *mut c_void, flags: u64);
        fn CGEventPost(tap: u32, event: *mut c_void);
        fn CGEventSourceKeyState(stateID: i32, keycode: u16) -> bool;
        fn CGEventSourceFlagsState(stateID: i32) -> u64;
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    extern "C" { fn CFRelease(cf: *mut c_void); }

    #[link(name = "AppKit", kind = "framework")]
    #[link(name = "Foundation", kind = "framework")]
    #[link(name = "objc", kind = "dylib")]
    extern "C" {
        fn objc_getClass(name: *const c_char) -> *mut c_void;
        fn sel_registerName(name: *const c_char) -> *mut c_void;
        fn objc_msgSend(receiver: *mut c_void, sel: *mut c_void, ...) -> *mut c_void;
    }

    #[derive(Serialize, Clone)]
    pub struct InlineConvertPayload {
        pub id: u64,
        pub text: String,
    }

    struct ConversionResponse { fixed_text: String, sound_enabled: bool }
    type PendingResponseMap = Arc<Mutex<HashMap<u64, mpsc::Sender<ConversionResponse>>>>;
    static PENDING_CONVERSIONS: LazyLock<PendingResponseMap> =
        LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));
    static INLINE_FIX_RUNNING: AtomicBool = AtomicBool::new(false);

    struct InlineFixRunGuard;

    impl Drop for InlineFixRunGuard {
        fn drop(&mut self) {
            INLINE_FIX_RUNNING.store(false, Ordering::Release);
        }
    }

    pub fn submit_conversion_response(id: u64, fixed_text: String, sound_enabled: bool) {
        if let Ok(mut map) = PENDING_CONVERSIONS.lock() {
            if let Some(sender) = map.remove(&id) { let _ = sender.send(ConversionResponse { fixed_text, sound_enabled }); }
        }
    }

    // ── StoreKit 2 Normalized Models ──────────────────────────────────────────
    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct StoreProduct {
        pub id: String,
        pub display_name: String,
        pub display_price: String,
        pub is_available: bool,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct StoreEntitlement {
        pub paid: bool,
        pub product_id: Option<String>,
        pub purchase_date: Option<String>,
        pub revocation_date: Option<String>,
        pub verification_status: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct PurchaseResult {
        pub status: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub error_message: Option<String>,
    }

    #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
    extern "C" {
        fn keyfixer_storekit_init_listener(callback: extern "C" fn(bool));
        fn keyfixer_storekit_get_entitlement_json() -> *const c_char;
        fn keyfixer_storekit_load_product_json() -> *const c_char;
        fn keyfixer_storekit_restore_purchases_json() -> *const c_char;
        fn keyfixer_storekit_purchase_pro_json() -> *const c_char;
        fn keyfixer_storekit_free_string(ptr: *const c_char);
    }

    #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
    unsafe fn parse_swift_json<T: serde::de::DeserializeOwned>(ptr: *const c_char) -> Option<T> {
        if ptr.is_null() { return None; }
        let c_str = CStr::from_ptr(ptr);
        let str_slice = c_str.to_str().ok()?;
        let val: Result<T, _> = serde_json::from_str(str_slice);
        keyfixer_storekit_free_string(ptr);
        val.ok()
    }

    #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
    extern "C" fn on_storekit_transaction_update(is_paid: bool) {
        if let Ok(guard) = PRO_STATE.lock() {
            if let Some(shared) = guard.as_ref() {
                let mut state_guard = shared.lock().unwrap();
                if is_paid {
                    state_guard.mode = ProMode::Paid;
                } else if state_guard.mode == ProMode::Paid {
                    state_guard.mode = ProMode::Free;
                }
                if let Ok(app_guard) = APP_HANDLE.lock() {
                    if let Some(app) = app_guard.as_ref() {
                        state_guard.save(app);
                        let dto = ProStateDto::from(&*state_guard);
                        let _ = app.emit("pro-state-changed", dto);
                    }
                }
            }
        }
    }

    pub static APP_HANDLE: LazyLock<Mutex<Option<AppHandle>>> =
        LazyLock::new(|| Mutex::new(None));

    pub fn init_pro_state(app: &AppHandle) -> SharedProState {
        if let Ok(mut guard) = APP_HANDLE.lock() {
            *guard = Some(app.clone());
        }

        let mut state = ProState::load(app);

        // ── StoreKit 2 Startup Entitlement Verification ───────────────────────
        // Production paid entitlement is derived ONLY from Apple StoreKit 2.
        #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
        {
            unsafe {
                keyfixer_storekit_init_listener(on_storekit_transaction_update);
                let entitlement_ptr = keyfixer_storekit_get_entitlement_json();
                if let Some(entitlement) = parse_swift_json::<StoreEntitlement>(entitlement_ptr) {
                    if entitlement.paid && entitlement.verification_status == "VERIFIED" {
                        state.mode = ProMode::Paid;
                    } else if state.mode == ProMode::Paid {
                        // Local state is never trusted over StoreKit 2 authority
                        state.mode = ProMode::Free;
                    }
                }
            }
        }

        state.save(app);
        let shared = Arc::new(Mutex::new(state));
        if let Ok(mut guard) = PRO_STATE.lock() { *guard = Some(shared.clone()); }
        shared
    }

    pub fn get_pro_state_dto(shared: &SharedProState) -> ProStateDto {
        ProStateDto::from(&*shared.lock().unwrap())
    }

    // ── StoreKit 2 Public Native Queries ──────────────────────────────────────

    pub fn storekit_load_pro_product() -> StoreProduct {
        #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
        {
            let ptr = unsafe { keyfixer_storekit_load_product_json() };
            if let Some(product) = unsafe { parse_swift_json::<StoreProduct>(ptr) } {
                return product;
            }
        }
        StoreProduct {
            id: "com.obadadallo.keyfixer.pro.lifetime".to_string(),
            display_name: "KeyFixer Pro Lifetime".to_string(),
            display_price: "".to_string(),
            is_available: false,
        }
    }

    pub fn storekit_get_pro_entitlement() -> StoreEntitlement {
        #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
        {
            let ptr = unsafe { keyfixer_storekit_get_entitlement_json() };
            if let Some(entitlement) = unsafe { parse_swift_json::<StoreEntitlement>(ptr) } {
                return entitlement;
            }
        }
        StoreEntitlement {
            paid: false,
            product_id: None,
            purchase_date: None,
            revocation_date: None,
            verification_status: "NOT_PURCHASED".to_string(),
        }
    }

    pub fn storekit_purchase_pro() -> PurchaseResult {
        #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
        {
            let ptr = unsafe { keyfixer_storekit_purchase_pro_json() };
            if let Some(res) = unsafe { parse_swift_json::<PurchaseResult>(ptr) } {
                return res;
            }
        }
        PurchaseResult {
            status: "FAILED".to_string(),
            error_message: Some("StoreKit 2 is not available in this build".to_string()),
        }
    }

    pub fn storekit_restore_purchases(app: &AppHandle) -> StoreEntitlement {
        #[cfg(all(feature = "pro", storekit_native_exists, target_os = "macos"))]
        {
            let ptr = unsafe { keyfixer_storekit_restore_purchases_json() };
            if let Some(entitlement) = unsafe { parse_swift_json::<StoreEntitlement>(ptr) } {
                if let Some(shared) = get_shared_state() {
                    let mut guard = shared.lock().unwrap();
                    if entitlement.paid && entitlement.verification_status == "VERIFIED" {
                        guard.mode = ProMode::Paid;
                    } else if guard.mode == ProMode::Paid {
                        guard.mode = ProMode::Free;
                    }
                    guard.save(app);
                    let dto = ProStateDto::from(&*guard);
                    let _ = app.emit("pro-state-changed", dto);
                }
                return entitlement;
            }
        }
        let _ = app;
        StoreEntitlement {
            paid: false,
            product_id: None,
            purchase_date: None,
            revocation_date: None,
            verification_status: "NOT_PURCHASED".to_string(),
        }
    }

    pub fn activate_trial(app: &AppHandle, shared: &SharedProState) -> ProStateDto {
        let mut guard = shared.lock().unwrap();
        if guard.mode == ProMode::Free {
            guard.mode = ProMode::Trial;
            guard.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
            guard.trial_credit_limit = TRIAL_CREDIT_LIMIT;
            guard.inline_fix_enabled = true;
            guard.trial_started = true;
            guard.save(app);
            eprintln!("{TAG} Trial activated. Credits: {}", guard.trial_credits_remaining);
        }
        ProStateDto::from(&*guard)
    }

    pub fn set_inline_fix_preference(app: &AppHandle, shared: &SharedProState, enabled: bool) {
        let mut guard = shared.lock().unwrap();
        guard.inline_fix_enabled = enabled;
        guard.save(app);
        eprintln!("{TAG} inlineFixEnabled = {enabled}");
    }

    pub fn check_post_event_access() -> bool {
        unsafe {
            CGPreflightPostEventAccess()
        }
    }

    pub fn request_post_event_access() -> bool {
        unsafe {
            CGRequestPostEventAccess()
        }
    }

    pub fn open_post_event_settings() {
        let _ = request_post_event_access();
        let _ = std::process::Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            .spawn();
    }


    #[cfg(debug_assertions)]
    pub fn dev_reset_trial_credits(app: &AppHandle, shared: &SharedProState) -> ProStateDto {
        let mut guard = shared.lock().unwrap();
        if guard.mode == ProMode::Trial {
            guard.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
            guard.trial_credit_limit = TRIAL_CREDIT_LIMIT;
            guard.save(app);
            eprintln!("{TAG} [DEV] Trial credits reset to 5");
        }
        ProStateDto::from(&*guard)
    }

    #[cfg(debug_assertions)]
    pub fn dev_simulate_paid(app: &AppHandle, shared: &SharedProState) -> ProStateDto {
        let mut guard = shared.lock().unwrap();
        guard.mode = ProMode::Paid;
        guard.save(app);
        eprintln!("{TAG} [DEV] Simulated PAID mode");
        ProStateDto::from(&*guard)
    }

    #[cfg(not(feature = "appstore"))]
    pub fn reset_trial_for_testing(app: &AppHandle, shared: &SharedProState) -> ProStateDto {
        let mut guard = shared.lock().unwrap();
        guard.mode = ProMode::Trial;
        guard.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
        guard.trial_credit_limit = TRIAL_CREDIT_LIMIT;
        guard.inline_fix_enabled = true;
        guard.trial_started = true;
        guard.save(app);
        let dto = ProStateDto::from(&*guard);
        if let Ok(val) = serde_json::to_value(&dto) {
            let _ = app.emit("pro-state-changed", val);
        }
        eprintln!("{TAG} [TEMP] Trial credits reset to 5 for testing");
        dto
    }

    #[cfg(not(feature = "appstore"))]
    pub fn reset_to_free_for_testing(app: &AppHandle, shared: &SharedProState) -> ProStateDto {
        let mut guard = shared.lock().unwrap();
        guard.mode = ProMode::Free;
        guard.trial_credits_remaining = 0;
        guard.inline_fix_enabled = false;
        guard.trial_started = false;
        guard.save(app);
        let dto = ProStateDto::from(&*guard);
        if let Ok(val) = serde_json::to_value(&dto) {
            let _ = app.emit("pro-state-changed", val);
        }
        eprintln!("{TAG} [TEMP] App reset to fresh FREE state");
        dto
    }

    fn show_main_window(app: &AppHandle) {
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.unminimize(); let _ = w.show(); let _ = w.set_focus();
            let _ = app.emit("shortcut-pressed", ());
        }
    }

    fn show_post_event_onboarding(app: &AppHandle) {
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.unminimize(); let _ = w.show(); let _ = w.set_focus();
            let _ = app.emit("show-post-event-onboarding", ());
        }
    }

    fn show_upgrade_modal(app: &AppHandle) {
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.unminimize(); let _ = w.show(); let _ = w.set_focus();
            let _ = app.emit("show-upgrade-modal", ());
        }
    }

    pub fn run_inline_fix(app: &AppHandle) {
        let start_time = Instant::now();
        eprintln!("{TAG} INLINE_FIX_SHORTCUT");
        if INLINE_FIX_RUNNING.compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire).is_err() {
            eprintln!("{TAG} INLINE_FIX_FAILED:busy");
            return;
        }
        let _run_guard = InlineFixRunGuard;

        let shared = match get_shared_state() {
            Some(s) => s,
            None => { eprintln!("{TAG} INLINE_FIX_FAILED:state_uninitialized"); return; }
        };

        let (ui, can_fix) = {
            let g = shared.lock().unwrap();
            (g.ui_state(), g.can_attempt_inline_fix())
        };
        eprintln!("{TAG} INLINE_FIX_STATE:{ui:?}:enabled={can_fix}");

        match ui {
            UiState::Free => { show_main_window(app); return; }
            UiState::TrialExhausted => { eprintln!("{TAG} EXHAUSTED — upgrade"); show_upgrade_modal(app); return; }
            UiState::TrialActive | UiState::Paid => {}
        }

        if !can_fix { show_main_window(app); return; }

        let post_event_allowed = check_post_event_access();
        eprintln!("{TAG} INLINE_FIX_PERMISSION:{post_event_allowed}");
        if !post_event_allowed {
            eprintln!("{TAG} INLINE_FIX_FAILED:permission");
            show_post_event_onboarding(app); return;
        }

        let result = perform_inline_fix(app, start_time);
        if !result.is_success() {
            eprintln!("{TAG} INLINE_FIX_FAILED:{}", result.failure_stage());
        }

        if result.is_success() {
            let mut guard = shared.lock().unwrap();
            match guard.mode {
                ProMode::Trial => {
                    guard.trial_credits_remaining = (guard.trial_credits_remaining - 1).max(0);
                    let remaining = guard.trial_credits_remaining;
                    guard.save(app);
                    drop(guard);
                    if remaining == 0 {
                        eprintln!("{TAG} Credits exhausted");
                        let _ = app.emit("trial-exhausted", ());
                    } else {
                        eprintln!("{TAG} Credit consumed. Remaining: {remaining}");
                        let _ = app.emit("inline-fix-succeeded", serde_json::json!({ "remaining": remaining }));
                    }
                }
                ProMode::Paid => {
                    drop(guard);
                    let _ = app.emit("inline-fix-succeeded", serde_json::json!({ "remaining": -1 }));
                }
                ProMode::Free => { drop(guard); }
            }
        }
    }

    fn perform_inline_fix(app: &AppHandle, start_time: Instant) -> InlineFixResult {
        let (target_pid, target_bundle) = match unsafe { get_frontmost_app() } {
            Some(t) => t,
            None => return InlineFixResult::NoSelection,
        };
        if target_bundle == "com.obadadallo.keyfixer" {
            return InlineFixResult::SelfFrontmost;
        }

        // Released is the K-key release; Command/Option can still be held by the user.
        // Require both sides and aggregate session flags to be clear for 3 samples.
        let poll_start_modifiers = Instant::now();
        let mut modifiers_released = false;
        let mut stable_samples = 0_u8;

        while poll_start_modifiers.elapsed() < MODIFIER_RELEASE_TIMEOUT {
            if unsafe { shortcut_modifiers_released() } {
                stable_samples += 1;
                if stable_samples >= 3 {
                    modifiers_released = true;
                    break;
                }
            } else {
                stable_samples = 0;
            }
            std::thread::sleep(Duration::from_millis(5));
        }

        if !modifiers_released {
            return InlineFixResult::ModifierReleaseTimeout;
        }
        eprintln!("{TAG} INLINE_FIX_MODIFIERS_RELEASED");

        std::thread::sleep(MODIFIER_SETTLE_TIME);

        let baseline = unsafe { get_pasteboard_change_count() };

        if !unsafe { synthesize_keystroke(VK_ANSI_C, CG_EVENT_FLAG_COMMAND) } {
            return InlineFixResult::CopyKeystrokeFailed;
        }
        eprintln!("{TAG} INLINE_FIX_COPY_POSTED");

        let mut changed = false;
        let poll_start = Instant::now();
        while poll_start.elapsed() < Duration::from_millis(350) {
            if unsafe { get_pasteboard_change_count() } > baseline { changed = true; break; }
            std::thread::sleep(Duration::from_millis(5));
        }
        if !changed { return InlineFixResult::NoSelection; }
        eprintln!("{TAG} INLINE_FIX_CLIPBOARD_CHANGED");

        let selected_text = match unsafe { get_pasteboard_text() } {
            Some(t) if !t.trim().is_empty() => t,
            _ => return InlineFixResult::ClipboardReadFailed,
        };

        let request_id = rand_id();
        let (tx, rx) = mpsc::channel::<ConversionResponse>();
        if let Ok(mut map) = PENDING_CONVERSIONS.lock() { map.insert(request_id, tx); }

        if let Err(e) = app.emit("inline-convert-request", InlineConvertPayload { id: request_id, text: selected_text.clone() }) {
            if let Ok(mut map) = PENDING_CONVERSIONS.lock() { map.remove(&request_id); }
            eprintln!("{TAG} INLINE_FIX_FAILED:conversion_emit:{e}");
            return InlineFixResult::ConversionFailed;
        }
        eprintln!("{TAG} INLINE_FIX_CONVERSION_REQUESTED");

        let response = match rx.recv_timeout(CONVERSION_TIMEOUT) {
            Ok(response) if !response.fixed_text.is_empty() => response,
            _ => {
                if let Ok(mut map) = PENDING_CONVERSIONS.lock() { map.remove(&request_id); }
                return InlineFixResult::ConversionFailed;
            }
        };
        let fixed_text = response.fixed_text;
        eprintln!("{TAG} INLINE_FIX_CONVERSION_RESPONSE");

        if fixed_text == selected_text {
            eprintln!("{TAG} Text already correct ({}ms)", start_time.elapsed().as_millis());
            return InlineFixResult::AlreadyCorrect;
        }

        if unsafe { get_frontmost_app() }.as_ref().map(|(p,_)| *p) != Some(target_pid) {
            eprintln!("{TAG} Target changed before write"); return InlineFixResult::TargetChanged;
        }

        if !unsafe { set_pasteboard_text(&fixed_text) } {
            return InlineFixResult::PasteWriteFailed;
        }

        if unsafe { get_frontmost_app() }.as_ref().map(|(p,_)| *p) != Some(target_pid) {
            eprintln!("{TAG} Target changed after write"); return InlineFixResult::TargetChanged;
        }

        std::thread::sleep(Duration::from_millis(15));

        if !unsafe { synthesize_keystroke(VK_ANSI_V, CG_EVENT_FLAG_COMMAND) } {
            return InlineFixResult::PasteKeystrokeFailed;
        }
        eprintln!("{TAG} INLINE_FIX_PASTE_POSTED");

        std::thread::sleep(Duration::from_millis(50));
        if unsafe { get_frontmost_app() }.as_ref().map(|(p,_)| *p) != Some(target_pid) {
            return InlineFixResult::TargetChanged;
        }
        eprintln!("{TAG} INLINE_FIX_SUCCESS:{}ms", start_time.elapsed().as_millis());
        if response.sound_enabled {
            std::thread::spawn(|| { let _ = std::process::Command::new("afplay").arg("/System/Library/Sounds/Tink.aiff").output(); });
        }
        InlineFixResult::Success { _converted_len: fixed_text.len() }
    }

    impl InlineFixResult {
        fn failure_stage(&self) -> &'static str {
            match self {
                InlineFixResult::Success { .. } => "none",
                InlineFixResult::NoSelection => "clipboard_timeout",
                InlineFixResult::ModifierReleaseTimeout => "modifier_release_timeout",
                InlineFixResult::CopyKeystrokeFailed => "copy_event",
                InlineFixResult::ClipboardReadFailed => "clipboard_read",
                InlineFixResult::ConversionFailed => "conversion",
                InlineFixResult::TargetChanged => "target_changed",
                InlineFixResult::PasteWriteFailed => "clipboard_write",
                InlineFixResult::PasteKeystrokeFailed => "paste_event",
                InlineFixResult::AlreadyCorrect => "already_correct",
                InlineFixResult::SelfFrontmost => "self_frontmost",
            }
        }
    }

    unsafe fn shortcut_modifiers_released() -> bool {
        let flags = CGEventSourceFlagsState(CG_EVENT_SOURCE_STATE_COMBINED_SESSION);
        let aggregate_clear = flags & (CG_EVENT_FLAG_COMMAND | CG_EVENT_FLAG_ALTERNATE) == 0;
        let physical_clear = !CGEventSourceKeyState(CG_EVENT_SOURCE_STATE_HID_SYSTEM, 55)
            && !CGEventSourceKeyState(CG_EVENT_SOURCE_STATE_HID_SYSTEM, 54)
            && !CGEventSourceKeyState(CG_EVENT_SOURCE_STATE_HID_SYSTEM, 58)
            && !CGEventSourceKeyState(CG_EVENT_SOURCE_STATE_HID_SYSTEM, 61);
        aggregate_clear && physical_clear
    }

    unsafe fn create_nsstring(s: &str) -> *mut c_void {
        let cls = objc_getClass(b"NSString\0".as_ptr() as *const _);
        let sel = sel_registerName(b"stringWithUTF8String:\0".as_ptr() as *const _);
        let c_str = CString::new(s).unwrap_or_default();
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void, *const c_char) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        f(cls, sel, c_str.as_ptr())
    }

    unsafe fn nsstring_to_string(ns_str: *mut c_void) -> Option<String> {
        if ns_str.is_null() { return None; }
        let sel = sel_registerName(b"UTF8String\0".as_ptr() as *const _);
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *const c_char =
            std::mem::transmute(objc_msgSend as *const ());
        let ptr = f(ns_str, sel);
        if ptr.is_null() { return None; }
        Some(CStr::from_ptr(ptr).to_string_lossy().into_owned())
    }

    unsafe fn get_frontmost_app() -> Option<(i32, String)> {
        let cls = objc_getClass(b"NSWorkspace\0".as_ptr() as *const _);
        let sel_shared = sel_registerName(b"sharedWorkspace\0".as_ptr() as *const _);
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let ws = f(cls, sel_shared);
        if ws.is_null() { return None; }
        let sel_front = sel_registerName(b"frontmostApplication\0".as_ptr() as *const _);
        let app_obj = f(ws, sel_front);
        if app_obj.is_null() { return None; }
        let sel_pid = sel_registerName(b"processIdentifier\0".as_ptr() as *const _);
        let f_i32: unsafe extern "C" fn(*mut c_void, *mut c_void) -> i32 =
            std::mem::transmute(objc_msgSend as *const ());
        let pid = f_i32(app_obj, sel_pid);
        let sel_bundle = sel_registerName(b"bundleIdentifier\0".as_ptr() as *const _);
        let bid_obj = f(app_obj, sel_bundle);
        let bundle = nsstring_to_string(bid_obj).unwrap_or_else(|| "unknown".to_string());
        Some((pid, bundle))
    }

    unsafe fn get_pasteboard_change_count() -> i64 {
        let cls = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_gen = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = f(cls, sel_gen);
        if pb.is_null() { return 0; }
        let sel_cc = sel_registerName(b"changeCount\0".as_ptr() as *const _);
        let f_isize: unsafe extern "C" fn(*mut c_void, *mut c_void) -> isize =
            std::mem::transmute(objc_msgSend as *const ());
        f_isize(pb, sel_cc) as i64
    }

    unsafe fn get_pasteboard_text() -> Option<String> {
        let cls = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_gen = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = f(cls, sel_gen);
        if pb.is_null() { return None; }
        let sel_str = sel_registerName(b"stringForType:\0".as_ptr() as *const _);
        let f2: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let ns_type = create_nsstring("public.utf8-plain-text");
        let mut obj = f2(pb, sel_str, ns_type);
        if obj.is_null() {
            let legacy = create_nsstring("NSStringPboardType");
            obj = f2(pb, sel_str, legacy);
        }
        nsstring_to_string(obj)
    }

    unsafe fn set_pasteboard_text(text: &str) -> bool {
        let cls = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_gen = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let f: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = f(cls, sel_gen);
        if pb.is_null() { return false; }
        let sel_clear = sel_registerName(b"clearContents\0".as_ptr() as *const _);
        let f_isize: unsafe extern "C" fn(*mut c_void, *mut c_void) -> isize =
            std::mem::transmute(objc_msgSend as *const ());
        f_isize(pb, sel_clear);
        let sel_set = sel_registerName(b"setString:forType:\0".as_ptr() as *const _);
        let f_bool: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void, *mut c_void) -> bool =
            std::mem::transmute(objc_msgSend as *const ());
        let ns_text = create_nsstring(text);
        let ns_type = create_nsstring("public.utf8-plain-text");
        f_bool(pb, sel_set, ns_text, ns_type)
    }

    unsafe fn synthesize_keystroke(virtual_key: u16, flags: u64) -> bool {
        // Use 0 (kCGEventSourceStateCombinedSessionState) so physical Option/Alt key state
        // currently held down by the user's fingers does not contaminate synthetic Cmd+C / Cmd+V
        let source = CGEventSourceCreate(0);
        let dn = CGEventCreateKeyboardEvent(source, virtual_key, true);
        if dn.is_null() {
            if !source.is_null() { CFRelease(source); }
            return false;
        }
        let up = CGEventCreateKeyboardEvent(source, virtual_key, false);
        if up.is_null() {
            CFRelease(dn);
            if !source.is_null() { CFRelease(source); }
            return false;
        }
        CGEventSetFlags(dn, flags);
        CGEventSetFlags(up, flags);
        // Post keydown to HID event stream
        CGEventPost(0, dn);
        std::thread::sleep(Duration::from_millis(12));
        // Post keyup to HID event stream
        CGEventPost(0, up);
        CFRelease(dn);
        CFRelease(up);
        if !source.is_null() { CFRelease(source); }
        true
    }

    static REQUEST_ID_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

    fn rand_id() -> u64 {
        REQUEST_ID_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    }
}
