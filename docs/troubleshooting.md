# Troubleshooting Guide (v1.3.1)

Common issues, diagnostics, and solutions across Web, Chrome Extension, Windows, and macOS platforms.

---

## 🪟 Windows Desktop & Microsoft Store

### Application fails to launch with missing WebView2 error
- KeyFixer relies on the **Microsoft Edge WebView2 Evergreen Runtime**.
- On modern Windows 10 & 11, WebView2 is pre-installed by default. If running on an older or stripped Windows build, install the runtime from [Microsoft WebView2 Installer](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### Global Shortcut (`Ctrl + Alt + K`) does not trigger
- Check if another application (such as AMD Radeon Software or Intel Graphics Command Center) has registered `Ctrl + Alt + K`.
- Ensure KeyFixer is running in the System Tray.

---

## 🌐 Chrome Extension

### Extension does not replace text in certain input fields
- Some third-party websites wrap inputs in cross-origin `<iframe>` elements which cannot be manipulated by page content scripts by design.
- If in-place replacement fails, KeyFixer automatically copies the converted text to your clipboard so you can simply paste it (`Ctrl+V` / `⌘V`).

### Extension Toast does not appear on restricted URLs
- Chrome security policy strictly blocks content scripts on `chrome://`, `edge://`, `chrome-extension://`, and the Chrome Web Store website itself.
- Test the extension on standard web domains (e.g. Google, Wikipedia, Twitter, Notion).

---

## 🍎 macOS Desktop App

### "KeyFixer is damaged and cannot be opened" (Gatekeeper)
- For unsigned direct builds downloaded outside the App Store, macOS Gatekeeper may apply a quarantine flag.
- To resolve:
  ```bash
  xattr -cr /Applications/KeyFixer.app
  ```

### Global Shortcut (`⌥⌘K`) does not show the window
- Left-click the KeyFixer icon in the menu bar to verify that the accessory app is running in the background.

---

## 🔊 Audio Feedback Issues (Web & Desktop)

### Synthesized keyboard click sound does not play
- Browsers enforce an **Autoplay / AudioContext Policy** that prevents sound synthesis until the user interacts with the page (clicks or types).
- Click the speaker sound icon in the toolbar to toggle sound effects on/off.
