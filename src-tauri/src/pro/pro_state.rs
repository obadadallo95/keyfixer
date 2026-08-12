/// Pro state persistence module.
/// Stores the single source of truth for entitlement, credits, and inline-fix preference.
/// Loaded from `{app_config_dir}/pro_state.json` on startup; written atomically on change.
///
/// IMPORTANT: `pro_state.json` is a LOCAL convenience file.
///            It is NOT proof of paid entitlement.
///            Future paid entitlement MUST come from a trusted licensing/payment provider.

use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

// ── Persisted mode ────────────────────────────────────────────────────────────

/// Stored entitlement mode. Never stores "exhausted" — that is a derived state.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProMode {
    Free,
    Trial,
    /// DEV-ONLY simulated. Real paid entitlement must come from a license provider.
    Paid,
}

impl Default for ProMode {
    fn default() -> Self { ProMode::Free }
}

// ── Derived UI state ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UiState {
    Free,
    TrialActive,
    TrialExhausted,
    Paid,
}

// ── Persisted state ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProState {
    /// Entitlement level. Never "exhausted" — that is derived.
    #[serde(default)]
    pub mode: ProMode,

    /// Remaining trial uses. Only meaningful when mode == Trial.
    #[serde(default = "default_trial_credits")]
    pub trial_credits_remaining: i32,

    /// Whether the user has ever explicitly started a trial.
    #[serde(default)]
    pub trial_started: bool,

    /// User preference — independent of entitlement.
    /// A PAID user may have inline_fix_enabled = false.
    #[serde(default)]
    pub inline_fix_enabled: bool,
}

fn default_trial_credits() -> i32 { 50 }

impl Default for ProState {
    fn default() -> Self {
        ProState {
            mode: ProMode::Free,
            trial_credits_remaining: default_trial_credits(),
            trial_started: false,
            inline_fix_enabled: false,
        }
    }
}

impl ProState {
    /// Derive the UI-facing state from persisted fields.
    pub fn ui_state(&self) -> UiState {
        match self.mode {
            ProMode::Paid => UiState::Paid,
            ProMode::Trial if self.trial_credits_remaining > 0 => UiState::TrialActive,
            ProMode::Trial => UiState::TrialExhausted,
            ProMode::Free => UiState::Free,
        }
    }

    /// True if the inline fix should be attempted at all.
    /// Requires entitlement (trial/paid), user preference, AND the caller still
    /// needs to verify Accessibility permission separately.
    pub fn can_attempt_inline_fix(&self) -> bool {
        self.inline_fix_enabled && matches!(self.ui_state(), UiState::TrialActive | UiState::Paid)
    }

    // ── Persistence ────────────────────────────────────────────────────────

    fn state_file_path(app: &AppHandle) -> Option<PathBuf> {
        app.path().app_config_dir().ok().map(|mut p| {
            p.push("pro_state.json");
            p
        })
    }

    /// Load from disk. Falls back to safe defaults on any error.
    pub fn load(app: &AppHandle) -> Self {
        let Some(path) = Self::state_file_path(app) else {
            eprintln!("[KeyFixer ProState] No config dir; using defaults");
            return Self::default();
        };
        if !path.exists() {
            eprintln!("[KeyFixer ProState] No state file found; using defaults (mode=free)");
            return Self::default();
        }
        match std::fs::read_to_string(&path) {
            Ok(json) => match serde_json::from_str::<ProState>(&json) {
                Ok(state) => {
                    eprintln!(
                        "[KeyFixer ProState] Loaded: mode={:?}, credits={}, inlineFixEnabled={}",
                        state.mode, state.trial_credits_remaining, state.inline_fix_enabled
                    );
                    state
                }
                Err(e) => {
                    eprintln!("[KeyFixer ProState] Parse error '{}'; resetting to defaults", e);
                    Self::default()
                }
            },
            Err(e) => {
                eprintln!("[KeyFixer ProState] Read error '{}'; using defaults", e);
                Self::default()
            }
        }
    }

    /// Write to disk atomically (write temp => rename).
    pub fn save(&self, app: &AppHandle) {
        let Some(path) = Self::state_file_path(app) else { return; };
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        match serde_json::to_string_pretty(self) {
            Ok(json) => {
                let tmp = path.with_extension("json.tmp");
                if std::fs::write(&tmp, &json).is_ok() {
                    let _ = std::fs::rename(&tmp, &path);
                    eprintln!(
                        "[KeyFixer ProState] Saved: mode={:?}, credits={}, inlineFixEnabled={}",
                        self.mode, self.trial_credits_remaining, self.inline_fix_enabled
                    );
                } else {
                    eprintln!("[KeyFixer ProState] Failed to write state file");
                }
            }
            Err(e) => eprintln!("[KeyFixer ProState] Serialization error: {}", e),
        }
    }
}

// ── DTO for Tauri command responses ──────────────────────────────────────────

/// Serializable snapshot sent to the frontend.
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
        let mode_str = match s.mode {
            ProMode::Free  => "free",
            ProMode::Trial => "trial",
            ProMode::Paid  => "paid",
        };
        ProStateDto {
            mode: mode_str.to_string(),
            ui_state: ui.to_string(),
            trial_credits_remaining: s.trial_credits_remaining,
            trial_started: s.trial_started,
            inline_fix_enabled: s.inline_fix_enabled,
        }
    }
}
