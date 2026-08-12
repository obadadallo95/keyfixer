use tauri::{
    command,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg(target_os = "windows")]
const SUPPORT_URL: &str = "https://obadadallo.web.app/contact/";

#[cfg(target_os = "macos")]
const GLOBAL_SHORTCUT_LABEL: &str = "⌥⌘K";

#[cfg(not(target_os = "macos"))]
const GLOBAL_SHORTCUT_LABEL: &str = "Ctrl+Alt+K";

fn toggle_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    let is_visible = window.is_visible().unwrap_or(false);
    let is_focused = window.is_focused().unwrap_or(false);

    if is_visible && is_focused {
        let _ = window.hide();
        return;
    }

    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

/// Collapse the window to a compact pill (~260×60)
#[command]
async fn collapse_window(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: 260,
            height: 60,
        }))
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Expand the window to the full editor (~400×520)
#[command]
async fn expand_window(app: AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: 400,
            height: 520,
        }))
        .map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

/// Close the application
#[command]
async fn close_app(app: AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

/// Start dragging the window natively
#[command]
async fn start_drag(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.start_dragging().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Restart the application completely
#[command]
fn restart_keyfixer(app: AppHandle) {
    app.restart();
}

/// Hide the application window
#[command]
async fn hide_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    Ok(())
}

/// Plays native auditory feedback for shortcut operations.
/// - macOS: Uses `Pop.aiff` for paste/open and `Tink.aiff` for accept/copy.
/// - Windows: Uses `SystemSounds::Beep` as a single native confirmation sound.
/// Playback is dispatched on a background thread and never blocks the workflow.
#[command]
fn play_feedback_sound(sound_type: String) {
    #[cfg(target_os = "macos")]
    {
        std::thread::spawn(move || {
            let sound_name = if sound_type == "paste" { "Pop" } else { "Tink" };
            let path = format!("/System/Library/Sounds/{}.aiff", sound_name);
            let _ = std::process::Command::new("afplay").arg(path).output();
        });
    }
    #[cfg(target_os = "windows")]
    {
        std::thread::spawn(move || {
            let _ = std::process::Command::new("powershell")
                .args(["-c", "[System.Media.SystemSounds]::Beep.Play()"])
                .output();
        });
    }
}

#[cfg(all(feature = "appstore", debug_assertions))]
compile_error!("Mac App Store release build must not include debug assertions / simulator commands!");

mod pro_bridge;

/// Check macOS PostEvent permission status silently
#[tauri::command]
fn check_post_event_permission() -> bool {
    pro_bridge::check_post_event_access()
}

/// Request macOS PostEvent permission
#[tauri::command]
fn request_post_event_permission() -> bool {
    pro_bridge::request_post_event_access()
}

/// Open macOS System Settings directly to Privacy panel
#[command]
fn open_post_event_settings() -> Result<(), String> {
    pro_bridge::open_post_event_settings();
    Ok(())
}

/// Submit response for inline conversion request from webview
#[command]
fn submit_conversion_response(id: u64, fixed_text: String) {
    pro_bridge::submit_conversion_response(id, fixed_text);
}

/// Return the full Pro state snapshot to the frontend
#[command]
fn get_pro_state(app: AppHandle) -> serde_json::Value {
    pro_bridge::get_pro_state_dto(&app).unwrap_or_else(|| serde_json::json!({
        "mode": "free",
        "uiState": "FREE",
        "trialCreditsRemaining": 0,
        "trialStarted": false,
        "inlineFixEnabled": false
    }))
}

/// Activate the trial (free -> trial). Idempotent if already trial/paid.
#[command]
fn activate_trial(app: AppHandle) -> bool {
    pro_bridge::activate_trial(&app)
}

/// Set the user's inline fix preference (independent of entitlement).
#[command]
fn set_inline_fix_preference(app: AppHandle, enabled: bool) {
    pro_bridge::set_inline_fix_preference(&app, enabled);
}

// ── StoreKit 2 Native Commands ────────────────────────────────────────────────

#[command]
fn storekit_load_pro_product(app: AppHandle) -> serde_json::Value {
    pro_bridge::storekit_load_pro_product(&app)
}

#[command]
fn storekit_get_pro_entitlement(app: AppHandle) -> serde_json::Value {
    pro_bridge::storekit_get_pro_entitlement(&app)
}

#[command]
fn storekit_purchase_pro(app: AppHandle) -> serde_json::Value {
    pro_bridge::storekit_purchase_pro(&app)
}

#[command]
fn storekit_restore_purchases(app: AppHandle) -> serde_json::Value {
    pro_bridge::storekit_restore_purchases(&app)
}

// ── DEV-ONLY commands (excluded from release/appstore builds) ────────────────

#[cfg(debug_assertions)]
#[command]
fn dev_reset_trial_credits(app: AppHandle) -> bool {
    pro_bridge::dev_reset_trial_credits(&app)
}

#[cfg(debug_assertions)]
#[command]
fn dev_simulate_paid(app: AppHandle) -> bool {
    pro_bridge::dev_simulate_paid(&app)
}

// ── TEMP: Testing-only reset — REMOVE BEFORE APP STORE SUBMISSION ────────────
#[cfg(not(feature = "appstore"))]
#[command]
fn reset_trial_for_testing(app: AppHandle) -> bool {
    pro_bridge::reset_trial_for_testing(&app)
}

#[cfg(not(feature = "appstore"))]
#[command]
fn reset_to_free_for_testing(app: AppHandle) -> bool {
    pro_bridge::reset_to_free_for_testing(&app)
}

/// Open the single approved support page in the Windows default browser.
#[command]
async fn open_support_page(app: AppHandle) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use tauri_plugin_opener::OpenerExt;

        return app
            .opener()
            .open_url(SUPPORT_URL, None::<&str>)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = app;
        Err("The support-page command is only available on Windows.".to_string())
    }
}

#[command]
fn log_fatal_startup_error(error_type: String, message: String, phase: String, timestamp: i64) {
    eprintln!("[FATAL STARTUP ERROR] Phase: {}, Type: {}, Timestamp: {}, Message: {}", phase, error_type, timestamp, message);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(target_os = "windows")]
    let builder = builder.plugin(tauri_plugin_opener::init());

    let builder = builder.plugin(tauri_plugin_clipboard_manager::init());

    // Production handler (always included)
    #[cfg(not(debug_assertions))]
    let app = builder
        .invoke_handler(tauri::generate_handler![
            collapse_window,
            expand_window,
            close_app,
            restart_keyfixer,
            start_drag,
            open_support_page,
            hide_window,
            play_feedback_sound,
            submit_conversion_response,
            get_pro_state,
            activate_trial,
            set_inline_fix_preference,
            check_post_event_permission,
            request_post_event_permission,
            open_post_event_settings,
            #[cfg(not(feature = "appstore"))]
            reset_trial_for_testing,
            #[cfg(not(feature = "appstore"))]
            reset_to_free_for_testing,
            storekit_load_pro_product,
            storekit_get_pro_entitlement,
            storekit_purchase_pro,
            storekit_restore_purchases,
            log_fatal_startup_error,
        ]);

    // Debug handler (includes DEV-ONLY commands)
    #[cfg(debug_assertions)]
    let app = builder
        .invoke_handler(tauri::generate_handler![
            collapse_window,
            expand_window,
            close_app,
            restart_keyfixer,
            start_drag,
            open_support_page,
            hide_window,
            play_feedback_sound,
            submit_conversion_response,
            get_pro_state,
            activate_trial,
            set_inline_fix_preference,
            check_post_event_permission,
            request_post_event_permission,
            open_post_event_settings,
            #[cfg(not(feature = "appstore"))]
            reset_trial_for_testing,
            #[cfg(not(feature = "appstore"))]
            reset_to_free_for_testing,
            storekit_load_pro_product,
            storekit_get_pro_entitlement,
            storekit_purchase_pro,
            storekit_restore_purchases,
            dev_reset_trial_credits,
            dev_simulate_paid,
            log_fatal_startup_error,
        ]);

    let app = app
        .setup(|app| {
            pro_bridge::init_pro_state(app.handle());

            #[cfg(target_os = "macos")]
            let keyfixer_shortcut = Shortcut::new(
                Some(Modifiers::ALT | Modifiers::SUPER),
                Code::KeyK,
            );

            #[cfg(not(target_os = "macos"))]
            let keyfixer_shortcut = Shortcut::new(
                Some(Modifiers::CONTROL | Modifiers::ALT),
                Code::KeyK,
            );
            let handled_shortcut = keyfixer_shortcut;

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, shortcut, event| {
                        if shortcut == &handled_shortcut
                            && event.state() == ShortcutState::Pressed
                        {
                            let app_handle = app.clone();
                            // run_inline_fix internally checks state, preference, accessibility
                            std::thread::spawn(move || {
                                pro_bridge::run_inline_fix(&app_handle);
                            });
                        }
                    })
                    .build(),
            )?;

            let shortcut_registered = app
                .global_shortcut()
                .register(keyfixer_shortcut)
                .is_ok();

            if !shortcut_registered {
                eprintln!(
                    "KeyFixer could not register the global shortcut {GLOBAL_SHORTCUT_LABEL}; it may already be in use."
                );
            }

            let quit_i = MenuItem::with_id(app, "quit", "إغلاق التطبيق (Quit)", true, None::<&str>)?;
            let show_label = if shortcut_registered {
                format!("إظهار KeyFixer ({GLOBAL_SHORTCUT_LABEL})")
            } else {
                "إظهار KeyFixer".to_string()
            };
            let show_i = MenuItem::with_id(app, "show", show_label, true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let tray_icon = tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon@2x.png"))
                .unwrap();

            #[cfg(target_os = "macos")]
            let builder = TrayIconBuilder::new()
                .icon(tray_icon)
                .icon_as_template(true)
                .menu(&menu)
                .show_menu_on_left_click(false);

            #[cfg(not(target_os = "macos"))]
            let builder = TrayIconBuilder::new()
                .icon(tray_icon)
                .menu(&menu)
                .show_menu_on_left_click(false);

            let builder = builder
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        toggle_main_window(app);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_main_window(app);
                    }
                });

            builder.build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {
        #[cfg(target_os = "macos")]
        if let tauri::RunEvent::Reopen { .. } = _event {
            if let Some(window) = _app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    });
}
