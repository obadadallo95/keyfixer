use tauri::{
    command,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

const GLOBAL_SHORTCUT_LABEL: &str = "⌥⌘K";

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            collapse_window,
            expand_window,
            close_app,
            start_drag,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let keyfixer_shortcut = Shortcut::new(
                Some(Modifiers::ALT | Modifiers::SUPER),
                Code::KeyK,
            );
            let handled_shortcut = keyfixer_shortcut;

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, shortcut, event| {
                        if shortcut == &handled_shortcut
                            && event.state() == ShortcutState::Pressed
                        {
                            toggle_main_window(app);
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

            let builder = TrayIconBuilder::new()
                .icon(tray_icon)
                .icon_as_template(true)
                .menu(&menu)
                .show_menu_on_left_click(false)
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

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Reopen { .. } = event {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    });
}
