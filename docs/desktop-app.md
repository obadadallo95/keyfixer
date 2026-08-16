# macOS Native Desktop Application (v1.3.1)

KeyFixer for macOS is a lightweight desktop utility engineered with **Tauri v2** and **Rust**. Designed to run silently in the menu bar, it provides instant global hotkey access without cluttering the macOS Dock.

---

## ⚡ Features & macOS Integration

- **Menu Bar Accessory Mode**: Runs quietly in the background as an accessory application without showing in the Dock or Cmd+Tab switcher.
- **System Tray Icon**:
  - Left-click: Instantly toggles the floating window and focuses the input editor.
  - Right-click: Opens native macOS context menu (`Show`, `About`, `Quit`).
- **Global Shortcut (`⌥⌘K`)**: Press Option + Command + K from any macOS application to show/hide KeyFixer.
- **Hide on Close**: Clicking the window's red traffic light button hides the window to memory instead of terminating.
- **Audio Feedback**: Synthesized system audio clicks on copy and conversion events.
- **Native Theme Adaptation**: Automatically responds to macOS Light and Dark mode changes.
- **StoreKit In-App Purchase Bridge**: Embedded sandboxed StoreKit bridge for optional Pro tier licensing.

---

## 🛠️ Building for macOS

### Development Mode
```bash
npm run dev:desktop
npm run tauri dev
```

### Direct Distribution DMG
```bash
npm run build:desktop
npm run tauri build -- --bundles dmg
```
*Output location:* `src-tauri/target/release/bundle/dmg/KeyFixer_1.3.1_aarch64.dmg`

### Mac App Store Sandboxed Build
```bash
npm run build:appstore
```
*Output location:* `src-tauri/target/release/bundle/app/KeyFixer.app`

For App Store provisioning profiles, Team ID configuration, and codesigning verification, see [docs/mac-app-store.md](mac-app-store.md).
