import AppKit
import Foundation

// ── Pure Layout Converter (Arabic ↔ English) ──────────────────────────────────

public struct KeyFixerConverter {
    // ── Windows Arabic 101 Base Map ───────────────────────────────────────────
    private static let winEnToAr: [Character: String] = [
        "`": "ذ", "1": "١", "2": "٢", "3": "٣", "4": "٤", "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩", "0": "٠", "-": "-", "=": "=",
        "q": "ض", "w": "ص", "e": "ث", "r": "ق", "t": "ف", "y": "غ", "u": "ع", "i": "ه", "o": "خ", "p": "ح", "[": "ج", "]": "د", "\\": "\\",
        "a": "ش", "s": "س", "d": "ي", "f": "ب", "g": "ل", "h": "ا", "j": "ت", "k": "ن", "l": "م", ";": "ك", "'": "ط",
        "z": "ئ", "x": "ء", "c": "ؤ", "v": "ر", "b": "لا", "n": "ى", "m": "ة", ",": "و", ".": "ز", "/": "ظ",
        "~": "ّ", "!": "!", "@": "@", "#": "#", "$": "$", "%": "%", "^": "^", "&": "&", "*": "*", "(": ")", ")": "(", "_": "_", "+": "+",
        "Q": "َ", "W": "ً", "E": "ُ", "R": "ٌ", "T": "لإ", "Y": "إ", "U": "‘", "I": "÷", "O": "×", "P": "؛", "{": "<", "}": ">", "|": "|",
        "A": "ِ", "S": "ٍ", "D": "]", "F": "[", "G": "لأ", "H": "أ", "J": "ـ", "K": "،", "L": "/", ":": ":", "\"": "\"",
        "Z": "~", "X": "ْ", "C": "}", "V": "{", "B": "لآ", "N": "آ", "M": "’", "<": ",", ">": ".", "?": "؟"
    ]

    // ── Mac Arabic Map ────────────────────────────────────────────────────────
    private static let macEnToAr: [Character: String] = {
        var map = winEnToAr
        let macOverrides: [Character: String] = [
            "`": "§", "[": "ج", "]": "ة", "'": "؛", "\\": "\\",
            "z": "ظ", "x": "ط", "c": "ذ", "v": "د", "b": "ز", "n": "ر", "m": "و", ",": "،", ".": ".", "/": "/",
            "~": "±", "Z": "ظ", "X": "ط", "C": "ئ", "V": "ء", "B": "أ", "N": "إ", "M": "ؤ", "<": ">", ">": "<", "?": "؟"
        ]
        for (k, v) in macOverrides { map[k] = v }
        return map
    }()

    private static let macArToEn: [String: String] = {
        var map: [String: String] = [:]
        for (enKey, arKey) in macEnToAr {
            if map[arKey] == nil {
                let enStr = String(enKey)
                if enStr.range(of: "^[A-Z]$", options: .regularExpression) != nil &&
                   arKey.range(of: "[\\[\\]\\{\\}\\/~`!@#$%^&*()_+=|\\\\:;\"'<>,.?]", options: .regularExpression) != nil {
                    continue
                }
                map[arKey] = enStr
            }
        }
        map["د"] = "v"
        map["ة"] = "]"
        map["ج"] = "["
        map["ظ"] = "z"
        map["ط"] = "x"
        map["ذ"] = "c"
        map["ز"] = "b"
        map["ر"] = "n"
        map["و"] = "m"
        map["،"] = ","
        map["؛"] = "'"
        map["أ"] = "H"
        map["إ"] = "Y"
        map["ؤ"] = "M"
        map["ئ"] = "C"
        map["ء"] = "V"
        map["لا"] = "gh"
        map["لأ"] = "G"
        map["لإ"] = "T"
        map["×"] = "O"
        map["÷"] = "I"
        map["]"] = "O"
        map["["] = "P"
        map["ـ"] = "J"
        map["؟"] = "?"
        map["}"] = "}"
        map["{"] = "{"
        map["/"] = "/"
        map["~"] = "~"
        map["َ"] = "Q"
        map["ً"] = "W"
        map["ُ"] = "E"
        map["ٌ"] = "R"
        map["ِ"] = "A"
        map["ٍ"] = "S"
        map["ْ"] = "X"
        map["ّ"] = "~"
        return map
    }()

    private static func isArabicBaseLetter(_ s: String) -> Bool {
        let pattern = "^[\\u0621-\\u063A\\u0641-\\u064A\\u0671-\\u06D3\\u067E\\u0686\\u0698\\u06AF]|^(لا|لأ|لإ|لآ)$"
        return s.range(of: pattern, options: .regularExpression) != nil
    }

    public static func detectMode(_ text: String) -> String {
        if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return "en2ar" }
        var enCount = 0
        var arCount = 0

        for ch in text {
            if macEnToAr[ch] != nil && String(ch).range(of: "[a-zA-Z;':,.\\/\\[\\]\\\\`~]", options: .regularExpression) != nil {
                enCount += 1
            } else if String(ch).range(of: "[\\u0600-\\u06FF]", options: .regularExpression) != nil {
                arCount += 1
            }
        }
        return enCount >= arCount ? "en2ar" : "ar2en"
    }

    public static func convert(_ text: String) -> String {
        if text.isEmpty { return "" }
        let mode = detectMode(text)
        let en2ar = macEnToAr
        let ar2en = macArToEn

        if mode == "en2ar" {
            var result = ""
            for ch in text {
                let s = String(ch)
                if s.range(of: "^[A-Z]$", options: .regularExpression) != nil {
                    let direct = en2ar[ch]
                    if text.count == 1 && direct != nil {
                        result += direct!
                    } else if let direct = direct, isArabicBaseLetter(direct) {
                        result += direct
                    } else {
                        let lower = Character(s.lowercased())
                        if let base = en2ar[lower] {
                            result += base
                        } else {
                            result += s
                        }
                    }
                } else if let mapped = en2ar[ch] {
                    result += mapped
                } else {
                    result += s
                }
            }
            return result
        } else {
            var result = ""
            let chars = Array(text)
            var i = 0
            while i < chars.count {
                if i + 1 < chars.count {
                    let doubleStr = String([chars[i], chars[i+1]])
                    if let mapped = ar2en[doubleStr] {
                        result += mapped
                        i += 2
                        continue
                    }
                }
                let chStr = String(chars[i])
                if (chStr == "]" || chStr == "[") && i + 1 < chars.count && String(chars[i+1]).range(of: "[a-zA-Z]", options: .regularExpression) != nil {
                    result += (chStr == "]") ? "O" : "I"
                } else if chStr == "أ" {
                    let prev = (i > 0) ? String(chars[i-1]) : ""
                    let isPrecededByO = prev == "]" || prev == "×" || result.hasSuffix("O")
                    result += isPrecededByO ? "B" : (ar2en["أ"] ?? "H")
                } else if let mapped = ar2en[chStr] {
                    result += mapped
                } else {
                    result += chStr
                }
                i += 1
            }
            return result
        }
    }
}

// ── NSServices Service Provider ───────────────────────────────────────────────

@objc public final class KeyFixerServiceProvider: NSObject {
    private var canExecuteCallback: (@convention(c) () -> Bool)?
    private var onFixSucceededCallback: (@convention(c) () -> Void)?

    public init(
        canExecute: (@convention(c) () -> Bool)? = nil,
        onFixSucceeded: (@convention(c) () -> Void)? = nil
    ) {
        self.canExecuteCallback = canExecute
        self.onFixSucceededCallback = onFixSucceeded
        super.init()
    }

    public func setCallbacks(
        canExecute: @escaping @convention(c) () -> Bool,
        onFixSucceeded: @escaping @convention(c) () -> Void
    ) {
        self.canExecuteCallback = canExecute
        self.onFixSucceededCallback = onFixSucceeded
    }

    @objc public func fixSelectedText(
        _ pboard: NSPasteboard,
        userData: String?,
        error: AutoreleasingUnsafeMutablePointer<NSString?>
    ) {
        // 1. Read input string exclusively from the dedicated service pasteboard.
        // The system general pasteboard is NEVER accessed or modified.
        guard let text = pboard.string(forType: .string) ??
                         pboard.string(forType: NSPasteboard.PasteboardType("public.utf8-plain-text")),
              !text.isEmpty else {
            NSLog("[KeyFixer Services] Empty selection received; ignoring invocation (zero charge).")
            return
        }

        // 2. Check Pro entitlement / Trial credit availability
        let canExecute = canExecuteCallback?() ?? false
        if !canExecute {
            NSLog("[KeyFixer Services] Invocation blocked: User is in Free mode or trial credits exhausted. Leaving selection intact (zero charge).")
            return
        }

        // 3. Perform pure layout conversion
        let converted = KeyFixerConverter.convert(text)
        if converted == text {
            NSLog("[KeyFixer Services] Text is already correct or untransformable; leaving text unchanged (zero charge).")
            return
        }

        // 4. Write converted text to service pasteboard
        pboard.clearContents()
        let writeSuccess = pboard.setString(converted, forType: .string)
        if !writeSuccess {
            NSLog("[KeyFixer Services] Failed to write converted text to service pasteboard; aborting (zero charge).")
            error.pointee = "Failed to write converted text to service pasteboard" as NSString
            return
        }

        // 5. POINT OF CHARGE:
        // Text has been successfully read, converted, and placed onto the service pasteboard for host replacement.
        // Note: macOS NSServices IPC is a one-way return via the service pasteboard; AppKit handles host
        // replacement without providing an asynchronous receipt callback to the service provider process.
        NSLog("[KeyFixer Services] Service invocation completed successfully. Calling onFixSucceeded.")
        onFixSucceededCallback?()
    }
}

// ── Shared Service Manager & C-ABI Exports ────────────────────────────────────

public final class KeyFixerServicesManager: @unchecked Sendable {
    public static let shared = KeyFixerServicesManager()
    private var provider: KeyFixerServiceProvider?
    private let lock = NSLock()

    private init() {}

    public func register(
        canExecute: @escaping @convention(c) () -> Bool,
        onFixSucceeded: @escaping @convention(c) () -> Void
    ) {
        lock.lock()
        defer { lock.unlock() }

        if let existing = provider {
            existing.setCallbacks(canExecute: canExecute, onFixSucceeded: onFixSucceeded)
        } else {
            let newProvider = KeyFixerServiceProvider(canExecute: canExecute, onFixSucceeded: onFixSucceeded)
            self.provider = newProvider
            DispatchQueue.main.async {
                NSApplication.shared.servicesProvider = newProvider
                NSUpdateDynamicServices()
                NSLog("[KeyFixer Services] Production NSServices provider registered with NSApplication.")
            }
        }
    }
}

@_cdecl("keyfixer_services_init")
public func keyfixer_services_init(
    canExecute: @escaping @convention(c) () -> Bool,
    onFixSucceeded: @escaping @convention(c) () -> Void
) {
    KeyFixerServicesManager.shared.register(
        canExecute: canExecute,
        onFixSucceeded: onFixSucceeded
    )
}
