use tauri::AppHandle;

#[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
#[path = "../../pro-private/native/inline_fix.rs"]
mod inline_fix;

#[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
pub use inline_fix::macos::{SharedProState, ProStateDto};

// ── Init ──────────────────────────────────────────────────────────────────────

pub fn init_pro_state(app: &AppHandle) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let shared = inline_fix::macos::init_pro_state(app);
        app.manage(shared);
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; }
}

// ── State queries ─────────────────────────────────────────────────────────────

pub fn get_pro_state_dto(app: &AppHandle) -> Option<serde_json::Value> {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        // app.state() panics if not managed; use inner PRO_STATE instead
        let shared = inline_fix::macos::get_shared_state()?;
        let dto = inline_fix::macos::get_pro_state_dto(&shared);
        return serde_json::to_value(dto).ok();
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; None }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

pub fn activate_trial(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::activate_trial(app, &shared);
        return true;
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; false }
}

pub fn set_inline_fix_preference(app: &AppHandle, enabled: bool) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return; };
        inline_fix::macos::set_inline_fix_preference(app, &shared, enabled);
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = (app, enabled); }
}

// ── Inline fix runner ─────────────────────────────────────────────────────────

pub fn run_inline_fix(app: &AppHandle) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    { inline_fix::macos::run_inline_fix(app); }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; }
}

// ── Accessibility ─────────────────────────────────────────────────────────────

pub fn check_accessibility() -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    { return inline_fix::macos::check_accessibility(); }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { true }
}

pub fn open_accessibility_settings() {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    { inline_fix::macos::open_accessibility_settings(); }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {}
}

// ── Conversion response ───────────────────────────────────────────────────────

pub fn submit_conversion_response(id: u64, fixed_text: String) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    { inline_fix::macos::submit_conversion_response(id, fixed_text); }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = (id, fixed_text); }
}

// ── StoreKit 2 Native Foundation ─────────────────────────────────────────────

pub fn storekit_load_pro_product(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
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
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
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
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
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
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
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
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let _ = app;
        let res = inline_fix::macos::storekit_purchase_pro();
        return serde_json::to_value(res).unwrap_or(serde_json::json!({
            "status": "FAILED",
            "errorMessage": "Failed to parse purchase result"
        }));
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        let _ = app;
        serde_json::json!({
            "status": "FAILED",
            "errorMessage": "StoreKit is only supported on macOS"
        })
    }
}

pub fn storekit_restore_purchases(app: &AppHandle) -> serde_json::Value {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let res = inline_fix::macos::storekit_restore_purchases(app);
        return serde_json::to_value(res).unwrap_or(serde_json::json!({
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
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
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

// ── DEV-ONLY commands (not compiled in release/appstore builds) ───────────────

#[cfg(debug_assertions)]
pub fn dev_reset_trial_credits(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::dev_reset_trial_credits(app, &shared);
        return true;
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; false }
}

#[cfg(debug_assertions)]
pub fn dev_simulate_paid(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::dev_simulate_paid(app, &shared);
        return true;
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; false }
}

// ── TEMP: Testing reset — REMOVE BEFORE APP STORE SUBMISSION ──────────────────

pub fn reset_trial_for_testing(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::reset_trial_for_testing(app, &shared);
        return true;
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; false }
}

pub fn reset_to_free_for_testing(app: &AppHandle) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        let Some(shared) = inline_fix::macos::get_shared_state() else { return false; };
        let _ = inline_fix::macos::reset_to_free_for_testing(app, &shared);
        return true;
    }
    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    { let _ = app; false }
}

