#[cfg(target_os = "macos")]
pub mod macos {
    use std::ffi::{c_char, c_void, CStr, CString};
    use std::sync::{Arc, LazyLock, Mutex, mpsc, atomic::{AtomicBool, Ordering}};
    use std::collections::HashMap;
    use std::time::{Duration, Instant};
    use std::path::PathBuf;
    use tauri::{AppHandle, Emitter, Manager};
    use serde::Serialize;

    // Diagnostic prefix for clear terminal logs
    const TAG: &str = "[KeyFixer InlineFix]";

    // CoreGraphics & Carbon virtual key codes
    const VK_ANSI_C: u16 = 0x08;
    const VK_ANSI_V: u16 = 0x09;
    const CG_EVENT_FLAG_COMMAND: u64 = 0x0010_0000;
    const CG_HID_EVENT_TAP: u32 = 0;

    pub static INLINE_FIX_ENABLED: AtomicBool = AtomicBool::new(false);

    #[link(name = "ApplicationServices", kind = "framework")]
    extern "C" {
        fn AXIsProcessTrusted() -> bool;
        fn AXIsProcessTrustedWithOptions(options: *mut c_void) -> bool;
    }

    #[link(name = "CoreGraphics", kind = "framework")]
    extern "C" {
        fn CGEventCreateKeyboardEvent(
            source: *mut c_void,
            virtual_key: u16,
            key_down: bool,
        ) -> *mut c_void;
        fn CGEventSetFlags(event: *mut c_void, flags: u64);
        fn CGEventPost(tap: u32, event: *mut c_void);
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    extern "C" {
        fn CFRelease(cf: *mut c_void);
    }

    #[link(name = "AppKit", kind = "framework")]
    #[link(name = "Foundation", kind = "framework")]
    #[link(name = "objc", kind = "dylib")]
    extern "C" {
        fn objc_getClass(name: *const c_char) -> *mut c_void;
        fn sel_registerName(name: *const c_char) -> *mut c_void;
        fn objc_msgSend(receiver: *mut c_void, sel: *mut c_void, ...) -> *mut c_void;
    }

    #[derive(Serialize, Clone)]
    pub struct InlineConvertPayload {
        pub id: u64,
        pub text: String,
    }

    type PendingResponseMap = Arc<Mutex<HashMap<u64, mpsc::Sender<String>>>>;
    pub static PENDING_CONVERSIONS: LazyLock<PendingResponseMap> =
        LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

    pub fn is_enabled() -> bool {
        INLINE_FIX_ENABLED.load(Ordering::SeqCst)
    }

    pub fn set_enabled(app: &AppHandle, val: bool) {
        INLINE_FIX_ENABLED.store(val, Ordering::SeqCst);
        save_persisted_setting(app, val);
        eprintln!("{TAG} Setting changed -> Pro Inline Fix enabled: {}", val);
    }

    pub fn check_accessibility() -> bool {
        unsafe { AXIsProcessTrusted() }
    }

    pub fn prompt_and_check_accessibility() -> bool {
        unsafe {
            let cls_nsdict = objc_getClass(b"NSDictionary\0".as_ptr() as *const _);
            let cls_nsnum = objc_getClass(b"NSNumber\0".as_ptr() as *const _);
            let sel_num_with_bool = sel_registerName(b"numberWithBool:\0".as_ptr() as *const _);
            let sel_dict_with_obj = sel_registerName(b"dictionaryWithObject:forKey:\0".as_ptr() as *const _);

            let msg_send_bool_obj: unsafe extern "C" fn(*mut c_void, *mut c_void, bool) -> *mut c_void =
                std::mem::transmute(objc_msgSend as *const ());
            let yes_num = msg_send_bool_obj(cls_nsnum, sel_num_with_bool, true);

            let key_str = create_nsstring("AXTrustedCheckOptionPrompt");
            let msg_send_dict: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void, *mut c_void) -> *mut c_void =
                std::mem::transmute(objc_msgSend as *const ());
            let dict = msg_send_dict(cls_nsdict, sel_dict_with_obj, yes_num, key_str);

            AXIsProcessTrustedWithOptions(dict)
        }
    }

    pub fn open_accessibility_settings() {
        let _ = prompt_and_check_accessibility();
        let _ = std::process::Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            .spawn();
    }

    fn get_config_path(app: &AppHandle) -> Option<PathBuf> {
        app.path().app_config_dir().ok().map(|mut p| {
            p.push("inline_fix_setting.txt");
            p
        })
    }

    pub fn init_persisted_setting(app: &AppHandle) {
        if let Some(path) = get_config_path(app) {
            if path.exists() {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    let enabled = content.trim() == "true" || content.trim() == "1";
                    INLINE_FIX_ENABLED.store(enabled, Ordering::SeqCst);
                    eprintln!("{TAG} Loaded persisted Pro Inline Fix setting: {}", enabled);
                    return;
                }
            }
        }
        INLINE_FIX_ENABLED.store(false, Ordering::SeqCst);
        eprintln!("{TAG} Default Pro Inline Fix setting initialized: false (OFF)");
    }

    fn save_persisted_setting(app: &AppHandle, val: bool) {
        if let Some(path) = get_config_path(app) {
            if let Some(parent) = path.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            let _ = std::fs::write(&path, if val { "true" } else { "false" });
        }
    }

    pub fn submit_conversion_response(id: u64, fixed_text: String) {
        if let Ok(mut map) = PENDING_CONVERSIONS.lock() {
            if let Some(sender) = map.remove(&id) {
                let _ = sender.send(fixed_text);
            }
        }
    }

    unsafe fn create_nsstring(s: &str) -> *mut c_void {
        let cls_nsstring = objc_getClass(b"NSString\0".as_ptr() as *const _);
        let sel_str_with_utf8 = sel_registerName(b"stringWithUTF8String:\0".as_ptr() as *const _);
        let c_str = CString::new(s).unwrap_or_default();
        let msg_send_obj_str: unsafe extern "C" fn(*mut c_void, *mut c_void, *const c_char) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        msg_send_obj_str(cls_nsstring, sel_str_with_utf8, c_str.as_ptr())
    }

    unsafe fn nsstring_to_string(ns_str: *mut c_void) -> Option<String> {
        if ns_str.is_null() {
            return None;
        }
        let sel_utf8_str = sel_registerName(b"UTF8String\0".as_ptr() as *const _);
        let msg_send_cstr: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *const c_char =
            std::mem::transmute(objc_msgSend as *const ());
        let c_ptr = msg_send_cstr(ns_str, sel_utf8_str);
        if c_ptr.is_null() {
            return None;
        }
        Some(CStr::from_ptr(c_ptr).to_string_lossy().into_owned())
    }

    unsafe fn get_frontmost_app() -> Option<(i32, String)> {
        let cls_nsworkspace = objc_getClass(b"NSWorkspace\0".as_ptr() as *const _);
        let sel_shared = sel_registerName(b"sharedWorkspace\0".as_ptr() as *const _);
        let msg_send_obj: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let workspace = msg_send_obj(cls_nsworkspace, sel_shared);
        if workspace.is_null() {
            return None;
        }

        let sel_frontmost = sel_registerName(b"frontmostApplication\0".as_ptr() as *const _);
        let app = msg_send_obj(workspace, sel_frontmost);
        if app.is_null() {
            return None;
        }

        let sel_pid = sel_registerName(b"processIdentifier\0".as_ptr() as *const _);
        let msg_send_i32: unsafe extern "C" fn(*mut c_void, *mut c_void) -> i32 =
            std::mem::transmute(objc_msgSend as *const ());
        let pid = msg_send_i32(app, sel_pid);

        let sel_bundle_id = sel_registerName(b"bundleIdentifier\0".as_ptr() as *const _);
        let bundle_id_obj = msg_send_obj(app, sel_bundle_id);
        let bundle_id = nsstring_to_string(bundle_id_obj).unwrap_or_else(|| "unknown".to_string());

        Some((pid, bundle_id))
    }

    unsafe fn get_pasteboard_change_count() -> i64 {
        let cls_pasteboard = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_general = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let msg_send_obj: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = msg_send_obj(cls_pasteboard, sel_general);
        if pb.is_null() {
            return 0;
        }

        let sel_change_count = sel_registerName(b"changeCount\0".as_ptr() as *const _);
        let msg_send_isize: unsafe extern "C" fn(*mut c_void, *mut c_void) -> isize =
            std::mem::transmute(objc_msgSend as *const ());
        msg_send_isize(pb, sel_change_count) as i64
    }

    unsafe fn get_pasteboard_text() -> Option<String> {
        let cls_pasteboard = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_general = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let msg_send_obj: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = msg_send_obj(cls_pasteboard, sel_general);
        if pb.is_null() {
            return None;
        }

        let sel_string_for_type = sel_registerName(b"stringForType:\0".as_ptr() as *const _);
        let msg_send_obj_with_arg: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());

        let ns_type = create_nsstring("public.utf8-plain-text");
        let mut str_obj = msg_send_obj_with_arg(pb, sel_string_for_type, ns_type);
        if str_obj.is_null() {
            let legacy_type = create_nsstring("NSStringPboardType");
            str_obj = msg_send_obj_with_arg(pb, sel_string_for_type, legacy_type);
        }

        nsstring_to_string(str_obj)
    }

    unsafe fn set_pasteboard_text(text: &str) -> bool {
        let cls_pasteboard = objc_getClass(b"NSPasteboard\0".as_ptr() as *const _);
        let sel_general = sel_registerName(b"generalPasteboard\0".as_ptr() as *const _);
        let msg_send_obj: unsafe extern "C" fn(*mut c_void, *mut c_void) -> *mut c_void =
            std::mem::transmute(objc_msgSend as *const ());
        let pb = msg_send_obj(cls_pasteboard, sel_general);
        if pb.is_null() {
            return false;
        }

        let sel_clear = sel_registerName(b"clearContents\0".as_ptr() as *const _);
        let msg_send_isize: unsafe extern "C" fn(*mut c_void, *mut c_void) -> isize =
            std::mem::transmute(objc_msgSend as *const ());
        msg_send_isize(pb, sel_clear);

        let sel_set_string = sel_registerName(b"setString:forType:\0".as_ptr() as *const _);
        let msg_send_bool: unsafe extern "C" fn(*mut c_void, *mut c_void, *mut c_void, *mut c_void) -> bool =
            std::mem::transmute(objc_msgSend as *const ());
        let ns_text = create_nsstring(text);
        let ns_type = create_nsstring("public.utf8-plain-text");
        msg_send_bool(pb, sel_set_string, ns_text, ns_type)
    }

    unsafe fn synthesize_keystroke(virtual_key: u16, flags: u64) -> bool {
        let event_down = CGEventCreateKeyboardEvent(std::ptr::null_mut(), virtual_key, true);
        if event_down.is_null() {
            return false;
        }
        let event_up = CGEventCreateKeyboardEvent(std::ptr::null_mut(), virtual_key, false);
        if event_up.is_null() {
            CFRelease(event_down);
            return false;
        }

        CGEventSetFlags(event_down, flags);
        CGEventSetFlags(event_up, flags);

        CGEventPost(CG_HID_EVENT_TAP, event_down);
        CGEventPost(CG_HID_EVENT_TAP, event_up);

        CFRelease(event_down);
        CFRelease(event_up);
        true
    }

    /// Primary native state machine for macOS inline fix
    pub fn run_inline_fix(app: &AppHandle) {
        let start_time = Instant::now();
        eprintln!("{TAG} [State: Idle -> CaptureTarget] Starting inline fix pipeline");

        // 1. Check Accessibility permission
        let has_permission = check_accessibility();
        if !has_permission {
            eprintln!("{TAG} ❌ Accessibility permission NOT granted! Grant access in System Settings > Privacy & Security > Accessibility");
            return;
        }
        eprintln!("{TAG} ✅ Accessibility permission verified");

        // 2. Capture Target App
        let (target_pid, target_bundle) = match unsafe { get_frontmost_app() } {
            Some((pid, bundle)) => (pid, bundle),
            None => {
                eprintln!("{TAG} ❌ [Abort] Could not capture frontmost application");
                return;
            }
        };

        if target_bundle == "com.obadadallo.keyfixer" {
            eprintln!("{TAG} ℹ️ [Abort] KeyFixer is frontmost; ignoring inline shortcut");
            return;
        }
        eprintln!("{TAG} 🎯 [State: CaptureTarget] Target captured: PID={}, Bundle='{}'", target_pid, target_bundle);

        // 3. Capture Baseline Clipboard
        let baseline_change_count = unsafe { get_pasteboard_change_count() };
        eprintln!("{TAG} 📋 [State: CaptureClipboardBaseline] Baseline changeCount={}", baseline_change_count);

        // 4. Send Copy (⌘+C)
        eprintln!("{TAG} ⌨️ [State: SendCopy] Synthesizing ⌘+C...");
        let copy_sent = unsafe { synthesize_keystroke(VK_ANSI_C, CG_EVENT_FLAG_COMMAND) };
        if !copy_sent {
            eprintln!("{TAG} ❌ [Abort] Failed to synthesize ⌘+C keystroke");
            return;
        }

        // 5. WaitForClipboardChange (deterministic polling, max 250ms)
        eprintln!("{TAG} ⏳ [State: WaitForClipboardChange] Awaiting pasteboard change (max 250ms)...");
        let mut changed = false;
        let poll_start = Instant::now();
        while poll_start.elapsed() < Duration::from_millis(250) {
            let current_count = unsafe { get_pasteboard_change_count() };
            if current_count > baseline_change_count {
                changed = true;
                break;
            }
            std::thread::sleep(Duration::from_millis(5));
        }

        if !changed {
            eprintln!("{TAG} ⚠️ [Abort] Clipboard did not change within timeout. Target had no text selected or ignored ⌘+C (Elapsed: {}ms)", start_time.elapsed().as_millis());
            return;
        }
        eprintln!("{TAG} 📋 [State: ClipboardChanged] Clipboard mutation detected in {}ms", poll_start.elapsed().as_millis());

        // 6. ReadSelection
        let selected_text = match unsafe { get_pasteboard_text() } {
            Some(t) if !t.trim().is_empty() => t,
            _ => {
                eprintln!("{TAG} ⚠️ [Abort] Selected clipboard text is empty or invalid (Elapsed: {}ms)", start_time.elapsed().as_millis());
                return;
            }
        };
        eprintln!("{TAG} 📖 [State: ReadSelection] Read {} characters from selection", selected_text.len());

        // 7. Convert via existing TypeScript conversion engine
        let request_id = rand_id();
        let (tx, rx) = mpsc::channel::<String>();
        if let Ok(mut map) = PENDING_CONVERSIONS.lock() {
            map.insert(request_id, tx);
        }

        let emit_res = app.emit("inline-convert-request", InlineConvertPayload {
            id: request_id,
            text: selected_text.clone(),
        });

        if let Err(e) = emit_res {
            eprintln!("{TAG} ❌ [Abort] Failed to emit conversion request to webview: {}", e);
            return;
        }

        let convert_start = Instant::now();
        let fixed_text = match rx.recv_timeout(Duration::from_millis(250)) {
            Ok(converted) => converted,
            Err(_) => {
                eprintln!("{TAG} ❌ [Abort] Conversion response timed out or channel disconnected");
                return;
            }
        };

        eprintln!("{TAG} 🔄 [State: Converted] Conversion resolved in {}ms", convert_start.elapsed().as_millis());

        if fixed_text == selected_text {
            eprintln!("{TAG} ℹ️ [Abort] Converted text is identical to input (layout is already correct). Aborting paste (Elapsed: {}ms)", start_time.elapsed().as_millis());
            return;
        }

        // 8. VerifyTargetStillFrontmost
        let current_target = unsafe { get_frontmost_app() };
        if current_target.as_ref().map(|(p, _)| *p) != Some(target_pid) {
            eprintln!("{TAG} 🛡️ [Abort] Target app switched before write! Expected PID {}, found {:?}. Aborting.", target_pid, current_target);
            return;
        }

        // 9. WriteCorrectedClipboard
        let write_success = unsafe { set_pasteboard_text(&fixed_text) };
        if !write_success {
            eprintln!("{TAG} ❌ [Abort] Failed to write converted text to NSPasteboard");
            return;
        }
        eprintln!("{TAG} ✍️ [State: WriteCorrectedClipboard] Corrected text written to pasteboard (length: {})", fixed_text.len());

        // 10. VerifyTargetAgain (Strict safety right before paste)
        let verify_again = unsafe { get_frontmost_app() };
        if verify_again.as_ref().map(|(p, _)| *p) != Some(target_pid) {
            eprintln!("{TAG} 🛡️ [Abort] Target app switched after write! Expected PID {}, found {:?}. Aborting paste.", target_pid, verify_again);
            return;
        }

        // Small stabilization pause (15ms) for target message queue readiness
        std::thread::sleep(Duration::from_millis(15));

        // 11. SendPaste (⌘+V)
        eprintln!("{TAG} ⌨️ [State: SendPaste] Synthesizing ⌘+V into target PID {}...", target_pid);
        let paste_sent = unsafe { synthesize_keystroke(VK_ANSI_V, CG_EVENT_FLAG_COMMAND) };
        if !paste_sent {
            eprintln!("{TAG} ❌ [Abort] Failed to synthesize ⌘+V keystroke");
            return;
        }

        // 12. Completed & Feedback
        eprintln!("{TAG} 🎉 [State: Completed] Successfully converted and pasted in {} (PID {}). Total time: {}ms", target_bundle, target_pid, start_time.elapsed().as_millis());

        // Play feedback sound in background
        std::thread::spawn(|| {
            let _ = std::process::Command::new("afplay")
                .arg("/System/Library/Sounds/Tink.aiff")
                .output();
        });
    }

    fn rand_id() -> u64 {
        use std::time::SystemTime;
        SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(1)
    }
}
