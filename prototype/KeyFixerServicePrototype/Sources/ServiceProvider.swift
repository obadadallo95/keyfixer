import AppKit
import Foundation

@objc public final class ServiceProvider: NSObject {
    @objc public func fixSelectedText(
        _ pboard: NSPasteboard,
        userData: String?,
        error: AutoreleasingUnsafeMutablePointer<NSString?>
    ) {
        // 1. Read input string exclusively from the dedicated service pasteboard.
        // Zero access to NSPasteboard.general
        guard let text = pboard.string(forType: .string) ??
                         pboard.string(forType: NSPasteboard.PasteboardType("public.utf8-plain-text")),
              !text.isEmpty else {
            NSLog("[KeyFixer Prototype] fixSelectedText called with empty pasteboard")
            return
        }

        NSLog("[KeyFixer Prototype] Received text (%ld chars): %@", text.count, text)

        // 2. Perform layout conversion using KeyFixer engine
        let converted = KeyFixerConverter.convert(text, platform: .mac)
        NSLog("[KeyFixer Prototype] Converted text (%ld chars): %@", converted.count, converted)

        // 3. Write back to the dedicated service pasteboard
        pboard.clearContents()
        let success = pboard.setString(converted, forType: .string)
        if !success {
            NSLog("[KeyFixer Prototype] Failed to write converted text to service pasteboard")
            error.pointee = "Failed to write converted text to service pasteboard" as NSString
        } else {
            NSLog("[KeyFixer Prototype] Successfully wrote converted text back to service pasteboard")
        }
    }
}
