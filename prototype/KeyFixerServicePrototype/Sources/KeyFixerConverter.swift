import Foundation

public enum KeyboardPlatform {
    case mac
    case windows
}

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

    public static func detectMode(_ text: String, platform: KeyboardPlatform = .mac) -> String {
        if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return "en2ar" }
        var enCount = 0
        var arCount = 0
        let enMap = (platform == .mac) ? macEnToAr : winEnToAr

        for ch in text {
            if enMap[ch] != nil && String(ch).range(of: "[a-zA-Z;':,.\\/\\[\\]\\\\`~]", options: .regularExpression) != nil {
                enCount += 1
            } else if String(ch).range(of: "[\\u0600-\\u06FF]", options: .regularExpression) != nil {
                arCount += 1
            }
        }
        return enCount >= arCount ? "en2ar" : "ar2en"
    }

    public static func convert(_ text: String, platform: KeyboardPlatform = .mac) -> String {
        if text.isEmpty { return "" }
        let mode = detectMode(text, platform: platform)
        let en2ar = (platform == .mac) ? macEnToAr : winEnToAr
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
            // ar2en
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
