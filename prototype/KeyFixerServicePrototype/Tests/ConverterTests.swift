import AppKit
import Foundation

@main
struct TestMain {
    static func main() {
        var passed = 0
        var failed = 0

        func assertEqual(_ actual: String, _ expected: String, _ testName: String) {
            if actual == expected {
                print("  ✅ PASS: \(testName)")
                passed += 1
            } else {
                print("  ❌ FAIL: \(testName)")
                print("     Expected: \"\(expected)\"")
                print("     Actual:   \"\(actual)\"")
                failed += 1
            }
        }

        print("\n─── 1. Pure Layout Conversion Tests (Mac Layout) ───")
        
        // Test 1: Simple greeting
        assertEqual(
            KeyFixerConverter.convert("lnpfh f;", platform: .mac),
            "مرحبا بك",
            "EN to AR: 'lnpfh f;' -> 'مرحبا بك'"
        )

        // Test 2: Reverse greeting
        assertEqual(
            KeyFixerConverter.convert("مرحبا بك", platform: .mac),
            "lnpfh f;",
            "AR to EN: 'مرحبا بك' -> 'lnpfh f;'"
        )

        // Test 3: Mac layout specific character conversions
        assertEqual(
            KeyFixerConverter.convert("z", platform: .mac),
            "ظ",
            "Mac 'z' -> 'ظ'"
        )
        assertEqual(
            KeyFixerConverter.convert("b", platform: .mac),
            "ز",
            "Mac 'b' -> 'ز'"
        )
        assertEqual(
            KeyFixerConverter.convert("gh", platform: .mac),
            "لا",
            "Mac 'gh' -> 'لا'"
        )

        // Test 4: Multiline text with emojis (Mac: n is ر)
        let multilineEn = "lnpfh 👋\nhggi h;fn\n123"
        let multilineAr = "مرحبا 👋\nالله اكبر\n١٢٣"
        assertEqual(
            KeyFixerConverter.convert(multilineEn, platform: .mac),
            multilineAr,
            "Multiline text with emojis and Arabic-Indic digits"
        )

        // Test 5: Reverse multiline with emojis
        assertEqual(
            KeyFixerConverter.convert("اثممخ 👋 🚀", platform: .windows),
            "hello 👋 🚀",
            "AR to EN with emojis"
        )

        print("\n─── 2. ServiceProvider Pasteboard Contract Tests ───")

        // Test 6: ServiceProvider with isolated NSPasteboard
        let customPb = NSPasteboard.withUniqueName()
        customPb.clearContents()
        customPb.setString("lnpfh", forType: .string)

        let provider = ServiceProvider()
        var err: NSString? = nil
        provider.fixSelectedText(customPb, userData: nil, error: &err)

        let result = customPb.string(forType: .string) ?? ""
        assertEqual(
            result,
            "مرحبا",
            "ServiceProvider converts text in isolated pasteboard"
        )

        // Test 7: Verify NSPasteboard.general is unaffected
        let generalPb = NSPasteboard.general
        let originalGeneralCount = generalPb.changeCount
        
        let isolatedPb = NSPasteboard.withUniqueName()
        isolatedPb.clearContents()
        isolatedPb.setString("j[vfjd", forType: .string)
        provider.fixSelectedText(isolatedPb, userData: nil, error: &err)

        if generalPb.changeCount == originalGeneralCount {
            print("  ✅ PASS: General clipboard was completely untouched (changeCount = \(originalGeneralCount))")
            passed += 1
        } else {
            print("  ❌ FAIL: General clipboard changeCount changed from \(originalGeneralCount) to \(generalPb.changeCount)")
            failed += 1
        }

        print("\n───────────────────────────────────────────────────")
        if failed == 0 {
            print("🎉 ALL \(passed) AUTOMATED PROTOTYPE TESTS PASSED.")
        } else {
            print("❌ \(failed) TESTS FAILED out of \(passed + failed).")
            exit(1)
        }
    }
}
