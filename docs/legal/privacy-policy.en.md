# Privacy Policy

**Effective Date:** August 8, 2026  
**Last Updated:** August 8, 2026  
**Product:** KeyFixer for macOS  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Overview
KeyFixer is a keyboard layout correction utility for macOS. We believe in privacy by design: all keyboard-layout text conversion occurs locally on your Mac. KeyFixer does not maintain user accounts, does not operate a text-processing backend, and does not upload your text to external servers.

---

## 2. Text Processing & Clipboard Access
- **Local Conversion:** All text conversion and layout correction algorithms execute locally on your device in volatile memory (RAM).
- **On-Demand Clipboard Interaction:** Clipboard interaction occurs only when you explicitly invoke KeyFixer (e.g., typing/pasting within the application window or using the **Inline Fix** shortcut `⌥⌘K`).
- **No Keystroke Logging or Background Monitoring:** KeyFixer does not continuously monitor your typing, is not a keylogger, does not create a typing history, and does not scan background documents or inactive windows.

---

## 3. macOS Accessibility & PostEvent Permission
To perform **Inline Fix** (directly correcting selected text within other applications), KeyFixer requests macOS system authorization (`PostEvent` / Accessibility).
- **Purpose:** This permission is used solely to execute the standard Copy (`Cmd+C`) and Paste (`Cmd+V`) workflow initiated when you explicitly press `⌥⌘K`.
- **Scope Limitation:** KeyFixer does not use this permission to observe user behavior, record screen activity, or inspect unselected application content.

---

## 4. In-App Purchases & Apple StoreKit
- **Transactions Handled by Apple:** Purchases (including **KeyFixer Pro Lifetime**) are processed exclusively through Apple’s In-App Purchase system (StoreKit).
- **No Financial Data Collected by KeyFixer:** KeyFixer does not collect, receive, or store your credit card details, bank credentials, or Apple Account passwords. Apple processes all billing, payment data, and currency conversions in accordance with Apple's Privacy Policy.
- **Entitlement Verification:** KeyFixer verifies purchase validity locally on-device using cryptographically signed StoreKit 2 transaction tokens.

---

## 5. Analytics, Diagnostics & Third-Party SDKs
- **No Third-Party Analytics:** KeyFixer does not integrate third-party advertising SDKs, analytics frameworks, or tracking tools.
- **Apple Diagnostics:** Anonymized crash logs and performance diagnostics may be provided to the developer by Apple through App Store Connect, subject to your macOS diagnostic and privacy settings.

---

## 6. Contact Information & Privacy Inquiries
For any questions regarding this Privacy Policy, please contact:
- **Developer:** Obada Dallo
- **Location:** Chemnitz, Germany
- **Email:** obada.dallo95@gmail.com
