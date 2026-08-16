#[allow(unused_imports)]
use tauri::{AppHandle, Manager};

#[cfg(all(feature = "pro", target_os = "macos"))]
#[path = "pro/inline_fix.rs"]
mod inline_fix;

#[cfg(all(feature = "pro", target_os = "windows"))]
#[path = "pro/inline_fix_windows.rs"]
mod inline_fix_windows;

#[cfg(all(feature = "pro", target_os = "macos"))]
#[allow(unused_imports)]
pub use inline_fix::macos::{SharedProState, ProStateDto};

#[cfg(all(feature = "pro", target_os = "windows"))]
#[allow(unused_imports)]
pub use inline_fix_windows::windows::{SharedProState, ProStateDto};

// ── Init ──────────────────────────────────────────────────────────────────────

pub fn init_pro_state(app: &AppHandle) {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let shared = inline_fix::macos::init_pro_state(app);
        app.manage(shared);
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let shared = inline_fix_windows::windows::init_pro_state(app);
        app.manage(shared);
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; }
}

// ── State queries ─────────────────────────────────────────────────────────────

pub fn get_pro_state_dto(_app: &AppHandle) -> Option<serde_json::Value> {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let shared = inline_fix::macos::get_shared_state()?;
        let dto = inline_fix::macos::get_pro_state_dto(&shared);
        return serde_json::to_value(dto).ok();
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let shared = inline_fix_windows::windows::get_shared_state()?;
        let dto = inline_fix_windows::windows::get_pro_state_dto(&shared);
        return serde_json::to_value(dto).ok();
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { None }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

pub fn activate_trial(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::activate_trial(app, &shared);
        return true;
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return false; };
        let _ = inline_fix_windows::windows::activate_trial(app, &shared);
        return true;
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; false }
}

pub fn set_inline_fix_preference(app: &AppHandle, enabled: bool) {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return; };
        inline_fix::macos::set_inline_fix_preference(app, &shared, enabled);
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return; };
        inline_fix_windows::windows::set_inline_fix_preference(app, &shared, enabled);
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = (app, enabled); }
}

// ── Inline fix runner ─────────────────────────────────────────────────────────

pub fn run_inline_fix(app: &AppHandle) {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    { inline_fix::macos::run_inline_fix(app); }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    { inline_fix_windows::windows::run_inline_fix(app); }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; }
}

// ── Accessibility ─────────────────────────────────────────────────────────────

pub fn check_post_event_access() -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    { return inline_fix::macos::check_post_event_access(); }
    #[cfg(not(all(feature = "pro", target_os = "macos")))]
    { return true; }
}

pub fn request_post_event_access() -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    { return inline_fix::macos::request_post_event_access(); }
    #[cfg(not(all(feature = "pro", target_os = "macos")))]
    { return true; }
}

pub fn open_post_event_settings() {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    { inline_fix::macos::open_post_event_settings(); }
    #[cfg(not(all(feature = "pro", target_os = "macos")))]
    {}
}

// ── Conversion response ───────────────────────────────────────────────────────

pub fn submit_conversion_response(id: u64, fixed_text: String, sound_enabled: bool) {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    { inline_fix::macos::submit_conversion_response(id, fixed_text, sound_enabled); }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    { inline_fix_windows::windows::submit_conversion_response(id, fixed_text, sound_enabled); }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = (id, fixed_text, sound_enabled); }
}

// ── StoreKit / Microsoft Store Integration ───────────────────────────────────

pub fn storekit_load_pro_product(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let _ = app;
        let p = inline_fix::macos::storekit_load_pro_product();
        return serde_json::to_value(p).unwrap_or(serde_json::json!({
            "id": "com.obadadallo.keyfixer.pro.lifetime",
            "displayName": "KeyFixer Pro Lifetime",
            "displayPrice": "",
            "isAvailable": false
        }));
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let p = inline_fix_windows::windows::store_load_pro_product(app);
        return serde_json::to_value(p).unwrap_or(serde_json::json!({
            "id": "9N98VZCQLDL7",
            "displayName": "KeyFixer Pro Lifetime",
            "displayPrice": "€9.99",
            "isAvailable": true
        }));
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    {
        let _ = app;
        serde_json::json!({
            "id": "com.obadadallo.keyfixer.pro.lifetime",
            "displayName": "KeyFixer Pro Lifetime",
            "displayPrice": "",
            "isAvailable": false
        })
    }
}

pub fn storekit_get_pro_entitlement(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let _ = app;
        let e = inline_fix::macos::storekit_get_pro_entitlement();
        return serde_json::to_value(e).unwrap_or(serde_json::json!({
            "paid": false,
            "productId": null,
            "purchaseDate": null,
            "revocationDate": null,
            "verificationStatus": "NOT_PURCHASED"
        }));
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let e = inline_fix_windows::windows::store_get_pro_entitlement(app);
        return serde_json::to_value(e).unwrap_or(serde_json::json!({
            "paid": false,
            "productId": null,
            "purchaseDate": null,
            "revocationDate": null,
            "verificationStatus": "NOT_PURCHASED"
        }));
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    {
        let _ = app;
        serde_json::json!({
            "paid": false,
            "productId": null,
            "purchaseDate": null,
            "revocationDate": null,
            "verificationStatus": "NOT_PURCHASED"
        })
    }
}

pub fn storekit_purchase_pro(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let _ = app;
        let res = inline_fix::macos::storekit_purchase_pro();
        return serde_json::to_value(res).unwrap_or(serde_json::json!({
            "status": "FAILED",
            "errorMessage": "Failed to parse purchase result"
        }));
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let res = inline_fix_windows::windows::store_purchase_pro(app);
        return serde_json::to_value(res).unwrap_or(serde_json::json!({
            "status": "FAILED",
            "errorMessage": "Failed to open Microsoft Store"
        }));
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    {
        let _ = app;
        serde_json::json!({
            "status": "FAILED",
            "errorMessage": "Store purchase is not supported on this platform"
        })
    }
}

pub fn storekit_restore_purchases(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let res = inline_fix::macos::storekit_restore_purchases(app);
        return serde_json::to_value(res).unwrap_or_else(|_| serde_json::json!({
            "status": "FAILED",
            "entitlement": {
                "paid": false,
                "productId": null,
                "purchaseDate": null,
                "revocationDate": null,
                "verificationStatus": "NOT_PURCHASED"
            },
            "errorMessage": "Failed to parse restore result"
        }));
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let res = inline_fix_windows::windows::store_restore_purchases(app);
        return serde_json::to_value(res).unwrap_or_else(|_| serde_json::json!({
            "status": "NOT_FOUND",
            "entitlement": {
                "paid": false,
                "productId": null,
                "purchaseDate": null,
                "revocationDate": null,
                "verificationStatus": "NOT_PURCHASED"
            },
            "errorMessage": "Failed to restore Microsoft Store purchase"
        }));
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    {
        let _ = app;
        serde_json::json!({
            "status": "NOT_FOUND",
            "entitlement": {
                "paid": false,
                "productId": null,
                "purchaseDate": null,
                "revocationDate": null,
                "verificationStatus": "NOT_PURCHASED"
            }
        })
    }
}

// ── DEV-ONLY commands ─────────────────────────────────────────────────────────

#[cfg(debug_assertions)]
pub fn dev_reset_trial_credits(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::dev_reset_trial_credits(app, &shared);
        return true;
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return false; };
        let _ = inline_fix_windows::windows::activate_trial(app, &shared);
        return true;
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; false }
}

#[cfg(debug_assertions)]
pub fn dev_simulate_paid(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::dev_simulate_paid(app, &shared);
        return true;
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return false; };
        let mut guard = shared.lock().unwrap();
        guard.mode = inline_fix_windows::windows::ProMode::Paid;
        guard.save(app);
        return true;
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; false }
}

// ── Testing Reset ─────────────────────────────────────────────────────────────

#[cfg(not(feature = "appstore"))]
pub fn reset_trial_for_testing(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::reset_trial_for_testing(app, &shared);
        return true;
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return false; };
        let _ = inline_fix_windows::windows::activate_trial(app, &shared);
        return true;
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; false }
}

#[cfg(not(feature = "appstore"))]
pub fn reset_to_free_for_testing(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::reset_to_free_for_testing(app, &shared);
        return true;
    }
    #[cfg(all(feature = "pro", target_os = "windows"))]
    {
        let Some(shared) = inline_fix_windows::windows::get_shared_state() else { return false; };
        let mut guard = shared.lock().unwrap();
        guard.mode = inline_fix_windows::windows::ProMode::Free;
        guard.save(app);
        return true;
    }
    #[cfg(not(any(
        all(feature = "pro", target_os = "macos"),
        all(feature = "pro", target_os = "windows")
    )))]
    { let _ = app; false }
}
