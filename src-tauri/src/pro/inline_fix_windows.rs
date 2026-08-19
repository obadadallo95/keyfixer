#[cfg(target_os = "windows")]
pub mod windows {
    use std::collections::HashMap;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::{mpsc, Arc, LazyLock, Mutex};
    use std::time::Duration;
    use serde::{Deserialize, Serialize};
    use tauri::{AppHandle, Emitter, Manager};
    use tauri_plugin_clipboard_manager::ClipboardExt;

    const TAG: &str = "[KeyFixer Windows Pro]";
    pub const PRO_ADDON_STORE_ID: &str = "9N98VZCQLDL7";
    pub const PRO_ADDON_PRODUCT_ID: &str = "keyfixer.pro.lifetime";
    pub const PARENT_STORE_ID: &str = "9PK3G83GP41D";
    pub const DEFAULT_DISPLAY_NAME: &str = "KeyFixer Pro Lifetime";

    const TRIAL_CREDIT_LIMIT: i32 = 25;
    const CONVERSION_TIMEOUT: Duration = Duration::from_millis(1200);

    #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "lowercase")]
    pub enum ProMode {
        Free,
        Trial,
        Paid,
    }

    impl Default for ProMode {
        fn default() -> Self {
            ProMode::Free
        }
    }

    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum UiState {
        Free,
        TrialActive,
        TrialExhausted,
        Paid,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct ProState {
        #[serde(default)]
        pub mode: ProMode,
        #[serde(default = "default_trial_credits")]
        pub trial_credits_remaining: i32,
        #[serde(default)]
        pub trial_started: bool,
        #[serde(default)]
        pub inline_fix_enabled: bool,
        #[serde(default = "default_trial_credits")]
        pub trial_credit_limit: i32,

        // Verified Entitlement Cache Fields
        #[serde(default)]
        pub verified_product_id: Option<String>,
        #[serde(default)]
        pub verified_store_id: Option<String>,
        #[serde(default)]
        pub verification_timestamp: Option<u64>,
        #[serde(default)]
        pub verification_signature: Option<String>,
    }

    fn default_trial_credits() -> i32 {
        TRIAL_CREDIT_LIMIT
    }

    impl Default for ProState {
        fn default() -> Self {
            ProState {
                mode: ProMode::Free,
                trial_credits_remaining: TRIAL_CREDIT_LIMIT,
                trial_started: false,
                inline_fix_enabled: false,
                trial_credit_limit: TRIAL_CREDIT_LIMIT,
                verified_product_id: None,
                verified_store_id: None,
                verification_timestamp: None,
                verification_signature: None,
            }
        }
    }

    fn generate_cache_token(timestamp: u64) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        "KF_MS_ENTITLEMENT_SALT_v1_9N98VZCQLDL7".hash(&mut hasher);
        PRO_ADDON_STORE_ID.hash(&mut hasher);
        PRO_ADDON_PRODUCT_ID.hash(&mut hasher);
        timestamp.hash(&mut hasher);
        format!("{:016x}", hasher.finish())
    }

    fn verify_cache_token(timestamp: u64, sig: &str) -> bool {
        generate_cache_token(timestamp) == sig
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

        pub fn is_entitlement_verified(&self) -> bool {
            if self.mode != ProMode::Paid {
                return false;
            }
            if let (Some(ts), Some(sig)) = (self.verification_timestamp, &self.verification_signature) {
                verify_cache_token(ts, sig)
            } else {
                false
            }
        }

        pub fn set_paid_verified(&mut self, app: &AppHandle) {
            self.mode = ProMode::Paid;
            self.inline_fix_enabled = true;
            self.verified_product_id = Some(PRO_ADDON_PRODUCT_ID.to_string());
            self.verified_store_id = Some(PRO_ADDON_STORE_ID.to_string());
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            self.verification_timestamp = Some(now);
            self.verification_signature = Some(generate_cache_token(now));
            self.save(app);
        }

        pub fn revoke_paid(&mut self, app: &AppHandle) {
            if self.trial_started {
                self.mode = ProMode::Trial;
            } else {
                self.mode = ProMode::Free;
            }
            self.verified_product_id = None;
            self.verified_store_id = None;
            self.verification_timestamp = None;
            self.verification_signature = None;
            self.save(app);
        }

        fn state_file_path(app: &AppHandle) -> Option<PathBuf> {
            app.path().app_config_dir().ok().map(|mut p| {
                p.push("pro_state.json");
                p
            })
        }

        pub fn load(app: &AppHandle) -> Self {
            let Some(path) = Self::state_file_path(app) else {
                return Self::default();
            };
            if !path.exists() {
                return Self::default();
            }
            match std::fs::read_to_string(&path) {
                Ok(json) => match serde_json::from_str::<ProState>(&json) {
                    Ok(mut state) => {
                        state.trial_credit_limit = TRIAL_CREDIT_LIMIT;
                        state
                    }
                    Err(e) => {
                        eprintln!("{TAG} Failed to parse pro_state.json: {e}");
                        Self::default()
                    }
                },
                Err(e) => {
                    eprintln!("{TAG} Failed to read pro_state.json: {e}");
                    Self::default()
                }
            }
        }

        pub fn save(&self, app: &AppHandle) {
            let Some(path) = Self::state_file_path(app) else {
                return;
            };
            if let Some(parent) = path.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            if let Ok(json) = serde_json::to_string_pretty(self) {
                let tmp = path.with_extension("tmp");
                if std::fs::write(&tmp, json.as_bytes()).is_ok() {
                    let _ = std::fs::rename(tmp, path);
                }
            }
        }
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct ProStateDto {
        pub mode: String,
        pub ui_state: String,
        pub trial_credits_remaining: i32,
        pub trial_started: bool,
        pub inline_fix_enabled: bool,
        pub trial_credit_limit: i32,
    }

    impl From<&ProState> for ProStateDto {
        fn from(s: &ProState) -> Self {
            let (mode_str, ui_str) = match s.ui_state() {
                UiState::Free => ("free", "FREE"),
                UiState::TrialActive => ("trial", "TRIAL_ACTIVE"),
                UiState::TrialExhausted => ("trial", "TRIAL_EXHAUSTED"),
                UiState::Paid => ("paid", "PAID"),
            };
            ProStateDto {
                mode: mode_str.to_string(),
                ui_state: ui_str.to_string(),
                trial_credits_remaining: s.trial_credits_remaining,
                trial_started: s.trial_started,
                inline_fix_enabled: s.inline_fix_enabled,
                trial_credit_limit: s.trial_credit_limit,
            }
        }
    }

    pub type SharedProState = Arc<Mutex<ProState>>;

    static PRO_STATE: LazyLock<Mutex<Option<SharedProState>>> = LazyLock::new(|| Mutex::new(None));
    static IN_FLIGHT: AtomicBool = AtomicBool::new(false);

    struct ConversionResponse {
        fixed_text: String,
        sound_enabled: bool,
    }

    static PENDING_CONVERSIONS: LazyLock<Mutex<HashMap<u64, mpsc::Sender<ConversionResponse>>>> =
        LazyLock::new(|| Mutex::new(HashMap::new()));
    static CONVERSION_ID_COUNTER: LazyLock<Mutex<u64>> = LazyLock::new(|| Mutex::new(1));

    pub fn init_pro_state(app: &AppHandle) -> SharedProState {
        let mut state = ProState::load(app);
        // If local JSON claims Paid without valid verification cache, reset
        if state.mode == ProMode::Paid && !state.is_entitlement_verified() {
            eprintln!("{TAG} Unverified Paid state in local storage on startup. Resetting to unverified default.");
            state.revoke_paid(app);
        }
        let shared = Arc::new(Mutex::new(state));
        *PRO_STATE.lock().unwrap() = Some(shared.clone());

        // Asynchronously synchronize entitlement with Microsoft Store in background
        let app_handle = app.clone();
        let shared_clone = shared.clone();
        let _ = std::thread::spawn(move || {
            // Give application window a short startup moment
            std::thread::sleep(Duration::from_millis(500));
            match ms_store::query_store_ownership(&app_handle) {
                Ok(true) => {
                    eprintln!("{TAG} Startup Store sync: KeyFixer Pro license verified with Microsoft Store!");
                    let mut guard = shared_clone.lock().unwrap();
                    guard.set_paid_verified(&app_handle);
                    let _ = app_handle.emit("pro-status-changed", serde_json::json!({ "mode": "paid" }));
                }
                Ok(false) => {
                    let mut guard = shared_clone.lock().unwrap();
                    if guard.mode == ProMode::Paid {
                        eprintln!("{TAG} Startup Store sync: No active Store license found. Reconciling to free/trial.");
                        guard.revoke_paid(&app_handle);
                        let _ = app_handle.emit("pro-status-changed", serde_json::json!({ "mode": "free" }));
                    }
                }
                Err(e) => {
                    eprintln!("{TAG} Startup Store sync unavailable (offline or dev environment): {e}");
                }
            }
        });

        shared
    }

    pub fn get_shared_state() -> Option<SharedProState> {
        PRO_STATE.lock().ok().and_then(|g| g.as_ref().cloned())
    }

    pub fn get_pro_state_dto(shared: &SharedProState) -> ProStateDto {
        let guard = shared.lock().unwrap();
        ProStateDto::from(&*guard)
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

    pub fn submit_conversion_response(id: u64, fixed_text: String, sound_enabled: bool) {
        if let Ok(mut map) = PENDING_CONVERSIONS.lock() {
            if let Some(sender) = map.remove(&id) {
                let _ = sender.send(ConversionResponse {
                    fixed_text,
                    sound_enabled,
                });
            }
        }
    }

    // ── Windows Win32 Key Simulation ──────────────────────────────────────────
    extern "system" {
        fn keybd_event(bVk: u8, bScan: u8, dwFlags: u32, dwExtraInfo: usize);
    }

    const VK_CONTROL: u8 = 0x11;
    const VK_C: u8 = 0x43;
    const VK_V: u8 = 0x56;
    const KEYEVENTF_KEYUP: u32 = 0x0002;

    unsafe fn simulate_copy() {
        keybd_event(VK_CONTROL, 0, 0, 0);
        keybd_event(VK_C, 0, 0, 0);
        keybd_event(VK_C, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
    }

    unsafe fn simulate_paste() {
        keybd_event(VK_CONTROL, 0, 0, 0);
        keybd_event(VK_V, 0, 0, 0);
        keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
    }

    // ── Inline Fix Runner for Windows ─────────────────────────────────────────
    pub fn run_inline_fix(app: &AppHandle) {
        if IN_FLIGHT.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
            eprintln!("{TAG} Already in flight, ignoring");
            return;
        }

        let app_clone = app.clone();
        let _ = std::thread::spawn(move || {
            struct FlightGuard;
            impl Drop for FlightGuard {
                fn drop(&mut self) {
                    IN_FLIGHT.store(false, Ordering::SeqCst);
                }
            }
            let _guard = FlightGuard;

            let Some(shared) = get_shared_state() else { return; };
            let (can_attempt, is_trial, mut credits) = {
                let guard = shared.lock().unwrap();
                (guard.can_attempt_inline_fix(), guard.mode == ProMode::Trial, guard.trial_credits_remaining)
            };

            if !can_attempt {
                let guard = shared.lock().unwrap();
                if guard.mode == ProMode::Free || (is_trial && credits <= 0) {
                    let _ = app_clone.emit("show-upgrade-modal", ());
                }
                return;
            }

            // Synthesize Copy (Ctrl+C)
            unsafe { simulate_copy(); }
            std::thread::sleep(Duration::from_millis(75));

            // Read clipboard via Tauri clipboard manager
            let clipboard = app_clone.clipboard();
            let raw_text = match clipboard.read_text() {
                Ok(text) if !text.trim().is_empty() => text,
                _ => {
                    eprintln!("{TAG} No text copied or empty selection");
                    return;
                }
            };

            // Request conversion from frontend
            let conv_id = {
                let mut c = CONVERSION_ID_COUNTER.lock().unwrap();
                let val = *c;
                *c += 1;
                val
            };

            let (tx, rx) = mpsc::channel();
            PENDING_CONVERSIONS.lock().unwrap().insert(conv_id, tx);

            let emit_res = app_clone.emit(
                "request-inline-conversion",
                serde_json::json!({
                    "id": conv_id,
                    "text": raw_text,
                }),
            );

            if emit_res.is_err() {
                PENDING_CONVERSIONS.lock().unwrap().remove(&conv_id);
                return;
            }

            let response = match rx.recv_timeout(CONVERSION_TIMEOUT) {
                Ok(r) => r,
                Err(_) => {
                    PENDING_CONVERSIONS.lock().unwrap().remove(&conv_id);
                    eprintln!("{TAG} Conversion timeout");
                    return;
                }
            };

            let fixed_text = response.fixed_text;
            if fixed_text.is_empty() || fixed_text == raw_text {
                eprintln!("{TAG} Text already correct or empty");
                return;
            }

            // Write fixed text to clipboard
            if clipboard.write_text(fixed_text).is_err() {
                eprintln!("{TAG} Failed to write to clipboard");
                return;
            }

            std::thread::sleep(Duration::from_millis(30));

            // Synthesize Paste (Ctrl+V)
            unsafe { simulate_paste(); }
            std::thread::sleep(Duration::from_millis(50));

            // Decrement trial credits only on actual successful replacement
            if is_trial {
                let mut guard = shared.lock().unwrap();
                if guard.mode == ProMode::Trial && guard.trial_credits_remaining > 0 {
                    guard.trial_credits_remaining -= 1;
                    credits = guard.trial_credits_remaining;
                    guard.save(&app_clone);
                    let _ = app_clone.emit("inline-fix-succeeded", serde_json::json!({ "remaining": credits }));
                    if credits <= 0 {
                        let _ = app_clone.emit("trial-exhausted", ());
                    }
                }
            } else {
                let _ = app_clone.emit("inline-fix-succeeded", serde_json::json!({ "remaining": 999 }));
            }

            eprintln!("{TAG} Inline fix applied successfully!");
        });
    }

    // ── Microsoft Store Integration Models ────────────────────────────────────
    #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct StoreProduct {
        pub id: String,
        pub display_name: String,
        pub display_price: String,
        pub is_available: bool,
    }

    #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct StoreEntitlement {
        pub paid: bool,
        pub product_id: Option<String>,
        pub purchase_date: Option<String>,
        pub revocation_date: Option<String>,
        pub verification_status: String,
    }

    #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct PurchaseResult {
        pub status: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub error_message: Option<String>,
    }

    #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
    #[serde(rename_all = "camelCase")]
    pub struct RestorePurchasesResult {
        pub status: String,
        pub entitlement: StoreEntitlement,
        #[serde(skip_serializing_if = "Option::is_none")]
        pub error_message: Option<String>,
    }

    // ── Microsoft Store Real WinRT Implementation ─────────────────────────────
    mod ms_store {
        use super::*;
        use windows::core::{Interface, HSTRING};
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::Shell::IInitializeWithWindow;
        use windows::Services::Store::{StoreContext, StorePurchaseStatus};
        use windows_collections::IIterable;
        use windows::Win32::Security::{GetTokenInformation, TokenElevation, TOKEN_ELEVATION, TOKEN_QUERY};
        use windows::Win32::System::Threading::{GetCurrentProcess, OpenProcessToken};
        use windows::Win32::Foundation::{CloseHandle, HANDLE};

        pub fn is_process_elevated() -> bool {
            unsafe {
                let mut token_handle = HANDLE::default();
                if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token_handle).is_ok() {
                    let mut elevation = TOKEN_ELEVATION::default();
                    let mut ret_len = 0;
                    let ok = GetTokenInformation(
                        token_handle,
                        TokenElevation,
                        Some(&mut elevation as *mut _ as *mut _),
                        std::mem::size_of::<TOKEN_ELEVATION>() as u32,
                        &mut ret_len,
                    ).is_ok();
                    let _ = CloseHandle(token_handle);
                    if ok {
                        return elevation.TokenIsElevated != 0;
                    }
                }
                false
            }
        }

        pub fn get_initialized_store_context(app: &AppHandle) -> Result<StoreContext, String> {
            let context = StoreContext::GetDefault().map_err(|e| format!("StoreContext::GetDefault failed: {e}"))?;

            // Associate with main window HWND so Store UI dialogs are properly parented
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(hwnd) = window.hwnd() {
                    let win32_hwnd = HWND(hwnd.0 as _);
                    if let Ok(init) = context.cast::<IInitializeWithWindow>() {
                        unsafe {
                            let _ = init.Initialize(win32_hwnd);
                        }
                    }
                }
            }

            Ok(context)
        }

        pub fn query_store_product(app: &AppHandle) -> Result<StoreProduct, String> {
            let context = get_initialized_store_context(app)?;

            let product_kinds = IIterable::<HSTRING>::from(vec![HSTRING::from("Durable")]);
            let store_ids = IIterable::<HSTRING>::from(vec![HSTRING::from(PRO_ADDON_STORE_ID)]);

            let op = context
                .GetStoreProductsAsync(&product_kinds, &store_ids)
                .map_err(|e| format!("GetStoreProductsAsync failed: {e}"))?;
            let query_result = op
                .get()
                .map_err(|e| format!("GetStoreProductsAsync execution failed: {e}"))?;

            let products = query_result
                .Products()
                .map_err(|e| format!("Products() failed: {e}"))?;

            let store_id_hstring = HSTRING::from(PRO_ADDON_STORE_ID);
            if products.HasKey(&store_id_hstring).unwrap_or(false) {
                if let Ok(product) = products.Lookup(&store_id_hstring) {
                    let title = product
                        .Title()
                        .map(|t| t.to_string())
                        .unwrap_or_else(|_| DEFAULT_DISPLAY_NAME.to_string());
                    let display_title = if title.trim().is_empty() {
                        DEFAULT_DISPLAY_NAME.to_string()
                    } else {
                        title
                    };
                    let formatted_price = product
                        .Price()
                        .and_then(|p| p.FormattedPrice())
                        .map(|p| p.to_string())
                        .unwrap_or_default();

                    return Ok(StoreProduct {
                        id: PRO_ADDON_STORE_ID.to_string(),
                        display_name: display_title,
                        display_price: formatted_price,
                        is_available: true,
                    });
                }
            }

            // Fallback: iterate over all products returned in map
            if let Ok(iterable) = products.First() {
                while let Ok(has_current) = iterable.HasCurrent() {
                    if !has_current {
                        break;
                    }
                    if let Ok(pair) = iterable.Current() {
                        let key = pair.Key().map(|k| k.to_string()).unwrap_or_default();
                        if let Ok(product) = pair.Value() {
                            let token = product.InAppOfferToken().map(|t| t.to_string()).unwrap_or_default();
                            let store_id = product.StoreId().map(|s| s.to_string()).unwrap_or_default();

                            if key == PRO_ADDON_STORE_ID
                                || key == PRO_ADDON_PRODUCT_ID
                                || store_id == PRO_ADDON_STORE_ID
                                || token == PRO_ADDON_PRODUCT_ID
                            {
                                let title = product
                                    .Title()
                                    .map(|t| t.to_string())
                                    .unwrap_or_else(|_| DEFAULT_DISPLAY_NAME.to_string());
                                let display_title = if title.trim().is_empty() {
                                    DEFAULT_DISPLAY_NAME.to_string()
                                } else {
                                    title
                                };
                                let formatted_price = product
                                    .Price()
                                    .and_then(|p| p.FormattedPrice())
                                    .map(|p| p.to_string())
                                    .unwrap_or_default();

                                return Ok(StoreProduct {
                                    id: PRO_ADDON_STORE_ID.to_string(),
                                    display_name: display_title,
                                    display_price: formatted_price,
                                    is_available: true,
                                });
                            }
                        }
                    }
                    let _ = iterable.MoveNext();
                }
            }

            Err("Product not found in Store response".to_string())
        }

        pub fn query_store_ownership(app: &AppHandle) -> Result<bool, String> {
            let context = get_initialized_store_context(app)?;

            let op = context.GetAppLicenseAsync().map_err(|e| format!("GetAppLicenseAsync failed: {e}"))?;
            let app_license = op.get().map_err(|e| format!("GetAppLicenseAsync execution failed: {e}"))?;

            let add_on_licenses = app_license.AddOnLicenses().map_err(|e| format!("AddOnLicenses failed: {e}"))?;
            let store_id_hstring = HSTRING::from(PRO_ADDON_STORE_ID);

            if add_on_licenses.HasKey(&store_id_hstring).unwrap_or(false) {
                let lic = add_on_licenses.Lookup(&store_id_hstring).map_err(|e| format!("Lookup license failed: {e}"))?;
                let is_active = lic.IsActive().unwrap_or(false);
                return Ok(is_active);
            }

            let offer_token_hstring = HSTRING::from(PRO_ADDON_PRODUCT_ID);
            if add_on_licenses.HasKey(&offer_token_hstring).unwrap_or(false) {
                let lic = add_on_licenses.Lookup(&offer_token_hstring).map_err(|e| format!("Lookup license failed: {e}"))?;
                let is_active = lic.IsActive().unwrap_or(false);
                return Ok(is_active);
            }

            // Exhaustive iteration over all active add-on licenses
            if let Ok(iterable) = add_on_licenses.First() {
                while let Ok(has_current) = iterable.HasCurrent() {
                    if !has_current { break; }
                    if let Ok(pair) = iterable.Current() {
                        let key = pair.Key().map(|k| k.to_string()).unwrap_or_default();
                        if let Ok(lic) = pair.Value() {
                            let token = lic.InAppOfferToken().map(|t| t.to_string()).unwrap_or_default();
                            let sku_store_id = lic.SkuStoreId().map(|s| s.to_string()).unwrap_or_default();
                            let is_active = lic.IsActive().unwrap_or(false);

                            if (key == PRO_ADDON_STORE_ID || key == PRO_ADDON_PRODUCT_ID ||
                                sku_store_id == PRO_ADDON_STORE_ID || token == PRO_ADDON_PRODUCT_ID) && is_active {
                                return Ok(true);
                            }
                        }
                    }
                    let _ = iterable.MoveNext();
                }
            }

            Ok(false)
        }

        pub fn execute_purchase(app: &AppHandle) -> PurchaseResult {
            if is_process_elevated() {
                return PurchaseResult {
                    status: "FAILED".to_string(),
                    error_message: Some("Purchases cannot be made from an elevated (Administrator) process. Please run KeyFixer as a standard user to complete your purchase.".to_string()),
                };
            }

            let context = match get_initialized_store_context(app) {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{TAG} StoreContext initialization failed: {e}");
                    return PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some("Microsoft Store is unavailable in unpackaged development builds. Please test purchases using the packaged MSIX build.".to_string()),
                    };
                }
            };

            let store_id_hstring = HSTRING::from(PRO_ADDON_STORE_ID);
            let op = match context.RequestPurchaseAsync(&store_id_hstring) {
                Ok(op) => op,
                Err(e) => {
                    eprintln!("{TAG} RequestPurchaseAsync call failed: {e}");
                    return PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some(format!("Could not initiate Microsoft Store purchase: {e}")),
                    };
                }
            };

            let result = match op.get() {
                Ok(r) => r,
                Err(e) => {
                    eprintln!("{TAG} RequestPurchaseAsync operation failed: {e}");
                    return PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some(format!("Purchase operation failed: {e}")),
                    };
                }
            };

            let status = match result.Status() {
                Ok(s) => s,
                Err(e) => {
                    return PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some(format!("Failed to read purchase status: {e}")),
                    };
                }
            };
            let extended_error = result.ExtendedError().err().map(|e| e.to_string());

            match status {
                StorePurchaseStatus::Succeeded | StorePurchaseStatus::AlreadyPurchased => {
                    eprintln!("{TAG} Purchase Succeeded or AlreadyPurchased. Reconciling ownership with Store.");
                    PurchaseResult {
                        status: "SUCCESS".to_string(),
                        error_message: None,
                    }
                }
                StorePurchaseStatus::NotPurchased => {
                    eprintln!("{TAG} User canceled purchase dialog.");
                    PurchaseResult {
                        status: "CANCELLED".to_string(),
                        error_message: None,
                    }
                }
                StorePurchaseStatus::NetworkError => {
                    eprintln!("{TAG} Network error during purchase.");
                    PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some("A network error occurred while connecting to Microsoft Store. Please check your internet connection and try again.".to_string()),
                    }
                }
                StorePurchaseStatus::ServerError => {
                    eprintln!("{TAG} Server error during purchase.");
                    PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: Some("A Microsoft Store server error occurred. Please try again later.".to_string()),
                    }
                }
                _ => {
                    eprintln!("{TAG} Unexpected purchase status: {status:?}, extended error: {extended_error:?}");
                    PurchaseResult {
                        status: "FAILED".to_string(),
                        error_message: extended_error.or_else(|| Some("An unexpected error occurred during purchase.".to_string())),
                    }
                }
            }
        }
    }

    // ── Public Store API Bridge Handlers ──────────────────────────────────────

    pub fn store_load_pro_product(app: &AppHandle) -> StoreProduct {
        match ms_store::query_store_product(app) {
            Ok(product) => product,
            Err(e) => {
                eprintln!("{TAG} Could not load dynamic product pricing from Microsoft Store ({e}). Using safe fallback.");
                StoreProduct {
                    id: PRO_ADDON_STORE_ID.to_string(),
                    display_name: DEFAULT_DISPLAY_NAME.to_string(),
                    display_price: String::new(),
                    is_available: true,
                }
            }
        }
    }

    pub fn store_get_pro_entitlement(_app: &AppHandle) -> StoreEntitlement {
        let (is_paid, verified_prod, timestamp) = get_shared_state()
            .map(|s| {
                let guard = s.lock().unwrap();
                (
                    guard.mode == ProMode::Paid && guard.is_entitlement_verified(),
                    guard.verified_product_id.clone(),
                    guard.verification_timestamp,
                )
            })
            .unwrap_or((false, None, None));

        if is_paid {
            StoreEntitlement {
                paid: true,
                product_id: verified_prod.or_else(|| Some(PRO_ADDON_PRODUCT_ID.to_string())),
                purchase_date: timestamp.map(|t| t.to_string()),
                revocation_date: None,
                verification_status: "VERIFIED".to_string(),
            }
        } else {
            StoreEntitlement {
                paid: false,
                product_id: None,
                purchase_date: None,
                revocation_date: None,
                verification_status: "NOT_PURCHASED".to_string(),
            }
        }
    }

    pub fn store_purchase_pro(app: &AppHandle) -> PurchaseResult {
        let res = ms_store::execute_purchase(app);
        if res.status == "SUCCESS" {
            if let Some(shared) = get_shared_state() {
                let mut guard = shared.lock().unwrap();
                guard.set_paid_verified(app);
            }
            let _ = app.emit("pro-status-changed", serde_json::json!({ "mode": "paid" }));
        }
        res
    }

    pub fn store_restore_purchases(app: &AppHandle) -> RestorePurchasesResult {
        match ms_store::query_store_ownership(app) {
            Ok(true) => {
                if let Some(shared) = get_shared_state() {
                    let mut guard = shared.lock().unwrap();
                    guard.set_paid_verified(app);
                }
                let _ = app.emit("pro-status-changed", serde_json::json!({ "mode": "paid" }));
                let entitlement = store_get_pro_entitlement(app);
                RestorePurchasesResult {
                    status: "RESTORED".to_string(),
                    entitlement,
                    error_message: None,
                }
            }
            Ok(false) => {
                if let Some(shared) = get_shared_state() {
                    let mut guard = shared.lock().unwrap();
                    if guard.mode == ProMode::Paid {
                        guard.revoke_paid(app);
                        let _ = app.emit("pro-status-changed", serde_json::json!({ "mode": "free" }));
                    }
                }
                let entitlement = store_get_pro_entitlement(app);
                RestorePurchasesResult {
                    status: "NOT_FOUND".to_string(),
                    entitlement,
                    error_message: None,
                }
            }
            Err(e) => {
                eprintln!("{TAG} Restore purchase query failed: {e}");
                let entitlement = store_get_pro_entitlement(app);
                RestorePurchasesResult {
                    status: "FAILED".to_string(),
                    entitlement,
                    error_message: Some("Could not connect to Microsoft Store to verify purchases. Please check your internet connection.".to_string()),
                }
            }
        }
    }
}
