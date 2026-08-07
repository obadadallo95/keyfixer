use tauri::AppHandle;

#[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
#[path = "../../pro-private/native/inline_fix.rs"]
mod inline_fix;

pub fn submit_conversion_response(id: u64, fixed_text: String) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    inline_fix::macos::submit_conversion_response(id, fixed_text);

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        let _ = (id, fixed_text);
    }
}

pub fn set_inline_fix_enabled(app: &AppHandle, enabled: bool) -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::set_enabled(app, enabled);
        enabled
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        let _ = (app, enabled);
        false
    }
}

pub fn is_inline_fix_enabled() -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::is_enabled()
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        false
    }
}

pub fn prompt_and_check_accessibility() -> bool {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::prompt_and_check_accessibility()
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        true
    }
}

pub fn open_accessibility_settings() {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::open_accessibility_settings();
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {}
}

pub fn init_persisted_setting(app: &AppHandle) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::init_persisted_setting(app);
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        let _ = app;
    }
}

pub fn run_inline_fix(app: &AppHandle) {
    #[cfg(all(feature = "pro", pro_private_exists, target_os = "macos"))]
    {
        inline_fix::macos::run_inline_fix(app);
    }

    #[cfg(not(all(feature = "pro", pro_private_exists, target_os = "macos")))]
    {
        let _ = app;
    }
}
