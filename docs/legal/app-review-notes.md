# App Store Review Notes

**App Name:** KeyFixer for macOS  
**Bundle Identifier:** `com.obadadallo.keyfixer`  
**In-App Purchase Product ID:** `com.obadadallo.keyfixer.pro.lifetime`  
**In-App Purchase Type:** Non-Consumable (One-Time Lifetime Unlock)  

---

### App Architecture & Review Information

1. **Free Core Utility:**
   KeyFixer provides free keyboard-layout text correction inside the main application window without restrictions or purchase requirements.

2. **On-Device Trial for Inline Fix:**
   KeyFixer includes a trial for the **Inline Fix** feature (`⌥⌘K`), which allows 5 successful direct text corrections in third-party applications. Trial credits are consumed only after a successful Inline Fix operation. When the 5 trial credits are exhausted, Inline Fix is locked and the user is prompted to unlock KeyFixer Pro Lifetime.

3. **KeyFixer Pro Lifetime (In-App Purchase):**
   - **Product ID:** `com.obadadallo.keyfixer.pro.lifetime`
   - **Type:** Non-Consumable.
   - **StoreKit Processing:** Transactions are handled entirely through Apple StoreKit. There are no subscriptions, recurring charges, or external payment links.
   - **Restore Purchases:** A visible "Restore Purchases" option is provided to query StoreKit and re-verify existing entitlements on compatible devices.

4. **System Permissions (Accessibility / PostEvent):**
   - KeyFixer requests system permission (`PostEvent` / Accessibility) solely to perform in-place text replacement in third-party applications when the user explicitly triggers the shortcut `⌥⌘K`.
   - Upon pressing `⌥⌘K`, the app synthesizes standard `Cmd+C` to copy the user's selected text, converts the layout locally in memory, and synthesizes `Cmd+V` to replace the selection with the corrected string.
   - **No Keylogging:** KeyFixer does not continuously monitor typing, does not record keystrokes, and does not inspect background documents.

5. **Privacy & Offline Architecture:**
   - All keyboard-layout text conversion runs 100% locally on-device in memory.
   - No user account or login is required.
   - No user text or clipboard contents are ever uploaded to external servers.
   - No third-party analytics, tracking SDKs, or advertising libraries are used.
