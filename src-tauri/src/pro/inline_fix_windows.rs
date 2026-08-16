#[cfg(target_os = "windows")]
pub mod windows {
    use std::collections::HashMap;
    use std::path::PathBuf;
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::{mpsc, Arc, LazyLock, Mutex};
    use std::time::{Duration};
    use serde::{Deserialize, Serialize};
    use tauri::{AppHandle, Emitter, Manager};
    use tauri_plugin_clipboard_manager::ClipboardExt;

    const TAG: &str = "[KeyFixer Windows Pro]";
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

        pub fn can_attempt_inline_fix(&self) -> bool {
            self.inline_fix_enabled && matches!(self.ui_state(), UiState::TrialActive | UiState::Paid)
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
        let state = ProState::load(app);
        let shared = Arc::new(Mutex::new(state));
        *PRO_STATE.lock().unwrap() = Some(shared.clone());
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
                Ok(Some(text)) if !text.trim().is_empty() => text,
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
            if clipboard.write_text(&fixed_text).is_err() {
                eprintln!("{TAG} Failed to write to clipboard");
                return;
            }

            std::thread::sleep(Duration::from_millis(30));

            // Synthesize Paste (Ctrl+V)
            unsafe { simulate_paste(); }
            std::thread::sleep(Duration::from_millis(50));

            // Decrement trial credits if applicable
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

    pub fn store_load_pro_product() -> StoreProduct {
        StoreProduct {
            id: "9PK3G83GP41D".to_string(),
            display_name: "KeyFixer Pro Lifetime".to_string(),
            display_price: "€9.99".to_string(),
            is_available: true,
        }
    }

    pub fn store_get_pro_entitlement() -> StoreEntitlement {
        let is_paid = get_shared_state()
            .map(|s| s.lock().unwrap().mode == ProMode::Paid)
            .unwrap_or(false);

        StoreEntitlement {
            paid: is_paid,
            product_id: if is_paid { Some("9PK3G83GP41D".to_string()) } else { None },
            purchase_date: None,
            revocation_date: None,
            verification_status: if is_paid { "VERIFIED".to_string() } else { "NOT_PURCHASED".to_string() },
        }
    }

    pub fn store_purchase_pro(_app: &AppHandle) -> PurchaseResult {
        // Open Microsoft Store product page
        let store_uri = "ms-windows-store://pdp/?productid=9PK3G83GP41D";
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", store_uri])
            .spawn();

        PurchaseResult {
            status: "SUCCESS".to_string(),
            error_message: None,
        }
    }

    pub fn store_restore_purchases(_app: &AppHandle) -> RestorePurchasesResult {
        let entitlement = store_get_pro_entitlement();
        RestorePurchasesResult {
            status: if entitlement.paid { "RESTORED".to_string() } else { "NOT_FOUND".to_string() },
            entitlement,
            error_message: None,
        }
    }
}
