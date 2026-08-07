use tauri::{
    command,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
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

mod inline_fix;

/// Submit response for inline conversion request from webview
#[command]
fn inline_convert_response(id: u64, fixed_text: String) {
    #[cfg(target_os = "macos")]
    inline_fix::macos::submit_conversion_response(id, fixed_text);
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (id, fixed_text);
    }
}

/// Enable or disable Pro Inline Fix mode
#[command]
fn set_inline_fix_enabled(app: AppHandle, enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        inline_fix::macos::set_enabled(&app, enabled);
        Ok(enabled)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (app, enabled);
        Ok(false)
    }
}

/// Query current Pro Inline Fix mode status
#[command]
fn get_inline_fix_enabled() -> bool {
    #[cfg(target_os = "macos")]
    {
        inline_fix::macos::is_enabled()
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

/// Check macOS Accessibility permission status
#[tauri::command]
fn check_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        inline_fix::macos::prompt_and_check_accessibility()
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

/// Open macOS System Settings directly to Accessibility panel
#[command]
fn open_accessibility_settings() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        inline_fix::macos::open_accessibility_settings();
        Ok(())
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(())
    }
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();

    #[cfg(target_os = "windows")]
    let builder = builder.plugin(tauri_plugin_opener::init());

    let builder = builder.plugin(tauri_plugin_clipboard_manager::init());

    let app = builder
        .invoke_handler(tauri::generate_handler![
            collapse_window,
            expand_window,
            close_app,
            start_drag,
            open_support_page,
            hide_window,
            play_feedback_sound,
            inline_convert_response,
            set_inline_fix_enabled,
            get_inline_fix_enabled,
            check_accessibility_permission,
            open_accessibility_settings,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            inline_fix::macos::init_persisted_setting(app.handle());

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
                            #[cfg(target_os = "macos")]
                            {
                                if inline_fix::macos::is_enabled() {
                                    let app_handle = app.clone();
                                    std::thread::spawn(move || {
                                        inline_fix::macos::run_inline_fix(&app_handle);
                                    });
                                } else {
                                    if let Some(window) = app.get_webview_window("main") {
                                        let _ = window.unminimize();
                                        let _ = window.show();
                                        let _ = window.set_focus();
                                        #[cfg(debug_assertions)]
                                        window.open_devtools();
                                        let _ = app.emit("shortcut-pressed", ());
                                    }
                                }
                            }
                            #[cfg(not(target_os = "macos"))]
                            {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.unminimize();
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    #[cfg(debug_assertions)]
                                    window.open_devtools();
                                    let _ = app.emit("shortcut-pressed", ());
                                }
                            }
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
