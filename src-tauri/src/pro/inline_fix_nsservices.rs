#[cfg(target_os = "macos")]
pub mod macos {
    use std::ffi::{c_char, CStr};
    use std::path::PathBuf;
    use std::sync::{Arc, LazyLock, Mutex};
    use tauri::{AppHandle, Emitter, Manager};
    use serde::{Deserialize, Serialize};

    // ── Inline Pro State types ──────────────────────────────────────────────

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
            ProState {
                mode: ProMode::Free,
                trial_credits_remaining: TRIAL_CREDIT_LIMIT,
                trial_started: false,
                inline_fix_enabled: true, // Default to enabled for NSServices Instant Fix
                trial_credit_limit: TRIAL_CREDIT_LIMIT,
            }
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

        pub fn can_attempt_instant_fix(&self) -> bool {
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
                        eprintln!("[KeyFixer ProState] Parse error: {e}; using defaults");
                        Self::default()
                    });
                    if state.mode == ProMode::Trial && state.trial_credit_limit < TRIAL_CREDIT_LIMIT {
                        state.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
                        state.trial_credit_limit = TRIAL_CREDIT_LIMIT;
                    }
                    state
                },
                Err(e) => {
                    eprintln!("[KeyFixer ProState] Read error: {e}");
                    Self::default()
                }
            }
        }

        pub fn save(&self, app: &AppHandle) {
            let Some(path) = Self::state_file_path(app) else { return; };
            if let Some(p) = path.parent() { let _ = std::fs::create_dir_all(p); }
            if let Ok(json) = serde_json::to_string_pretty(self) {
                let tmp = path.with_extension("json.tmp");
                if std::fs::write(&tmp, &json).is_ok() {
                    let _ = std::fs::rename(&tmp, &path);
                }
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
        pub is_app_store: bool,
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
                is_app_store: true,
            }
        }
    }

    const TAG: &str = "[KeyFixer NSServices]";

    pub type SharedProState = Arc<Mutex<ProState>>;

    pub static PRO_STATE: LazyLock<Mutex<Option<SharedProState>>> =
        LazyLock::new(|| Mutex::new(None));

    pub static APP_HANDLE: LazyLock<Mutex<Option<AppHandle>>> =
        LazyLock::new(|| Mutex::new(None));

    pub fn get_shared_state() -> Option<SharedProState> {
        PRO_STATE.lock().ok()?.clone()
    }

    // ── NSServices C-ABI FFI ──────────────────────────────────────────────────

    extern "C" {
        fn keyfixer_services_init(
            can_execute: extern "C" fn() -> bool,
            on_succeeded: extern "C" fn()
        );
    }

    extern "C" fn services_can_execute_fix() -> bool {
        if let Some(shared) = get_shared_state() {
            if let Ok(guard) = shared.lock() {
                return guard.can_attempt_instant_fix();
            }
        }
        false
    }

    extern "C" fn services_on_fix_succeeded() {
        if let Some(shared) = get_shared_state() {
            if let Ok(mut guard) = shared.lock() {
                let mut remaining_to_emit = -1;
                let mut trial_exhausted = false;

                match guard.mode {
                    ProMode::Trial => {
                        guard.trial_credits_remaining = (guard.trial_credits_remaining - 1).max(0);
                        remaining_to_emit = guard.trial_credits_remaining;
                        if remaining_to_emit == 0 {
                            trial_exhausted = true;
                        }
                    }
                    ProMode::Paid => {
                        remaining_to_emit = -1;
                    }
                    ProMode::Free => {}
                }

                if let Ok(app_guard) = APP_HANDLE.lock() {
                    if let Some(app) = app_guard.as_ref() {
                        guard.save(app);
                        if trial_exhausted {
                            drop(guard);
                            sync_global_shortcut_state(app);
                            eprintln!("{TAG} Trial credits exhausted (0 remaining) -> Re-registered global ⌥⌘K for Free workflow");
                            let _ = app.emit("trial-exhausted", ());
                        } else {
                            eprintln!("{TAG} Instant Fix succeeded. Remaining credits: {remaining_to_emit}");
                            let _ = app.emit("inline-fix-succeeded", serde_json::json!({ "remaining": remaining_to_emit }));
                        }
                    }
                }
            }
        }
        // Play gentle Tink sound on background thread
        std::thread::spawn(|| {
            let _ = std::process::Command::new("afplay")
                .arg("/System/Library/Sounds/Tink.aiff")
                .output();
        });
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

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct RestorePurchasesResult {
        pub status: String,
        pub entitlement: StoreEntitlement,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub error_message: Option<String>,
    }

    #[cfg(storekit_native_exists)]
    extern "C" {
        fn keyfixer_storekit_init_listener(callback: extern "C" fn(bool));
        fn keyfixer_storekit_get_entitlement_json() -> *const c_char;
        fn keyfixer_storekit_load_product_json() -> *const c_char;
        fn keyfixer_storekit_restore_purchases_json() -> *const c_char;
        fn keyfixer_storekit_purchase_pro_json() -> *const c_char;
        fn keyfixer_storekit_free_string(ptr: *const c_char);
    }

    #[cfg(storekit_native_exists)]
    unsafe fn parse_swift_json<T: serde::de::DeserializeOwned>(ptr: *const c_char) -> Option<T> {
        if ptr.is_null() { return None; }
        let c_str = CStr::from_ptr(ptr);
        let str_slice = c_str.to_str().ok()?;
        let val: Result<T, _> = serde_json::from_str(str_slice);
        keyfixer_storekit_free_string(ptr);
        val.ok()
    }

    #[cfg(storekit_native_exists)]
    extern "C" fn on_storekit_transaction_update(is_paid: bool) {
        if let Ok(guard) = PRO_STATE.lock() {
            if let Some(shared) = guard.as_ref() {
                let mut state_guard = shared.lock().unwrap();
                let changed = if is_paid && state_guard.mode != ProMode::Paid {
                    state_guard.mode = ProMode::Paid;
                    true
                } else if !is_paid && state_guard.mode == ProMode::Paid {
                    state_guard.mode = ProMode::Free;
                    true
                } else {
                    false
                };

                if changed {
                    if let Ok(app_guard) = APP_HANDLE.lock() {
                        if let Some(app) = app_guard.as_ref() {
                            state_guard.save(app);
                            let dto = ProStateDto::from(&*state_guard);
                            drop(state_guard);
                            sync_global_shortcut_state(app);
                            let _ = app.emit("pro-state-changed", dto);
                        }
                    }
                }
            }
        }
    }

    pub fn init_pro_state(app: &AppHandle) -> SharedProState {
        if let Ok(mut guard) = APP_HANDLE.lock() {
            *guard = Some(app.clone());
        }

        #[allow(unused_mut)]
        let mut state = ProState::load(app);

        // ── Initialize Native NSServices Provider ─────────────────────────────
        unsafe {
            keyfixer_services_init(services_can_execute_fix, services_on_fix_succeeded);
            eprintln!("{TAG} Initialized native NSServices provider with zero Accessibility permissions.");
        }

        // ── StoreKit 2 Startup Entitlement Verification ───────────────────────
        #[cfg(storekit_native_exists)]
        {
            unsafe {
                keyfixer_storekit_init_listener(on_storekit_transaction_update);
                let entitlement_ptr = keyfixer_storekit_get_entitlement_json();
                if let Some(entitlement) = parse_swift_json::<StoreEntitlement>(entitlement_ptr) {
                    if entitlement.paid && entitlement.verification_status == "VERIFIED" {
                        state.mode = ProMode::Paid;
                    } else if state.mode == ProMode::Paid {
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

    pub fn storekit_load_pro_product() -> StoreProduct {
        #[cfg(storekit_native_exists)]
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
        #[cfg(storekit_native_exists)]
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
        #[cfg(storekit_native_exists)]
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

    pub fn storekit_restore_purchases(app: &AppHandle) -> RestorePurchasesResult {
        #[cfg(storekit_native_exists)]
        {
            let ptr = unsafe { keyfixer_storekit_restore_purchases_json() };
            if let Some(result) = unsafe { parse_swift_json::<RestorePurchasesResult>(ptr) } {
                if let Some(shared) = get_shared_state() {
                    let mut guard = shared.lock().unwrap();
                    if result.entitlement.paid && result.entitlement.verification_status == "VERIFIED" {
                        guard.mode = ProMode::Paid;
                    } else if result.status != "FAILED" && guard.mode == ProMode::Paid {
                        guard.mode = ProMode::Free;
                    }
                    guard.save(app);
                    let dto = ProStateDto::from(&*guard);
                    drop(guard);
                    sync_global_shortcut_state(app);
                    let _ = app.emit("pro-state-changed", dto);
                }
                return result;
            }
        }
        let _ = app;
        RestorePurchasesResult {
            status: "FAILED".to_string(),
            entitlement: StoreEntitlement {
                paid: false,
                product_id: None,
                purchase_date: None,
                revocation_date: None,
                verification_status: "NOT_PURCHASED".to_string(),
            },
            error_message: Some("Failed to parse StoreKit restore result".to_string()),
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
            drop(guard);
            sync_global_shortcut_state(app);
            eprintln!("{TAG} Trial activated. Credits: {}", TRIAL_CREDIT_LIMIT);
        }
        ProStateDto::from(&*shared.lock().unwrap())
    }

    pub fn set_inline_fix_preference(app: &AppHandle, shared: &SharedProState, enabled: bool) {
        let mut guard = shared.lock().unwrap();
        guard.inline_fix_enabled = enabled;
        guard.save(app);
        let dto = ProStateDto::from(&*guard);
        drop(guard);
        sync_global_shortcut_state(app);
        let _ = app.emit("pro-state-changed", dto);
        eprintln!("{TAG} Instant Fix Preference = {enabled}");
    }

    /// Dynamically registers or unregisters the global ⌥⌘K shortcut on macOS main thread based on current entitlement.
    /// - Free / Instant Fix disabled: ⌥⌘K is registered globally to drive the automated clipboard workflow.
    /// - Trial / Paid (Instant Fix active): ⌥⌘K is UNREGISTERED globally so host apps route ⌥⌘K to NSServices.
    pub fn sync_global_shortcut_state(app: &AppHandle) {
        let app_handle = app.clone();
        let _ = app.run_on_main_thread(move || {
            use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

            let keyfixer_shortcut = Shortcut::new(
                Some(Modifiers::ALT | Modifiers::SUPER),
                Code::KeyK,
            );

            let should_use_nsservices = if let Some(shared) = get_shared_state() {
                if let Ok(guard) = shared.lock() {
                    guard.can_attempt_instant_fix()
                } else {
                    false
                }
            } else {
                false
            };

            let global_sc = app_handle.global_shortcut();

            if should_use_nsservices {
                // Instant Fix active (Trial / Paid): unregister global shortcut so NSServices in host apps receives ⌥⌘K
                if global_sc.is_registered(keyfixer_shortcut) {
                    let _ = global_sc.unregister(keyfixer_shortcut);
                    eprintln!("{TAG} [Dynamic Shortcut] Unregistered global ⌥⌘K on main thread (NSServices Instant Fix active)");
                }
            } else {
                // Free / Instant Fix inactive: register global shortcut for automated clipboard workflow
                if !global_sc.is_registered(keyfixer_shortcut) {
                    let res = global_sc.register(keyfixer_shortcut);
                    if res.is_ok() {
                        eprintln!("{TAG} [Dynamic Shortcut] Registered global ⌥⌘K on main thread (Free automated clipboard workflow active)");
                    } else {
                        eprintln!("{TAG} [Dynamic Shortcut] Could not register global ⌥⌘K: {:?}", res.err());
                    }
                }
            }
        });
    }

    // In the App Store edition, zero Accessibility / PostEvent permissions are needed.
    pub fn check_post_event_access() -> bool { true }
    pub fn request_post_event_access() -> bool { true }
    pub fn open_post_event_settings() {}
    #[allow(dead_code)]
    pub fn run_inline_fix(_app: &AppHandle) {}
    pub fn submit_conversion_response(_id: u64, _fixed_text: String, _sound_enabled: bool) {}

    #[cfg(debug_assertions)]
    pub fn dev_reset_trial_credits(app: &AppHandle, shared: &SharedProState) -> bool {
        let mut guard = shared.lock().unwrap();
        guard.mode = ProMode::Trial;
        guard.trial_credits_remaining = TRIAL_CREDIT_LIMIT;
        guard.trial_credit_limit = TRIAL_CREDIT_LIMIT;
        guard.trial_started = true;
        guard.save(app);
        drop(guard);
        sync_global_shortcut_state(app);
        true
    }

    #[cfg(debug_assertions)]
    pub fn dev_simulate_paid(app: &AppHandle, shared: &SharedProState) -> bool {
        let mut guard = shared.lock().unwrap();
        guard.mode = ProMode::Paid;
        guard.save(app);
        drop(guard);
        sync_global_shortcut_state(app);
        true
    }
}
