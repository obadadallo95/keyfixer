# macOS Native Desktop App

KeyFixer includes a native macOS desktop application built with **Tauri v2** and **Rust**. It is designed to live silently in the menu bar and serve as a quick desktop utility.

## Features

- **Accessory App (Background Mode)**: Runs completely in the background without cluttering the macOS Dock or application switcher.
- **System Tray Icon (Menu Bar)**: Left-clicking the icon toggles window visibility, and right-clicking opens a native context menu with Show and Quit options.
- **macOS Light & Dark Mode Support**: Auto-detects the operating system's color scheme and renders native light/dark UI elements seamlessly.
- **Window Hide on Close**: Clicking the red close traffic light button (`x`) hides the window instead of exiting the application.
- **Global Shortcut**: Press `⌥⌘K` from any application to show or hide KeyFixer and focus the input editor.
- **Draggable Window Header**: Click and drag the title bar to move the window anywhere on your screen.
- **Privacy First**: The macOS app has no analytics, advertising, tracking, or network-dependent text processing.

## Installation & Gatekeeper Workaround

GitHub development builds may be unsigned and can be blocked by macOS Gatekeeper. Mac App Store releases are sandboxed and signed through the Apple Developer Program.

To open it:
1. Drag the `KeyFixer.app` into your **Applications** folder.
2. **Right-click (or Control-click)** the app icon and select **Open**.
3. Click **Open** on the warning dialog that appears.
4. *If you receive a "KeyFixer is damaged and cannot be opened" warning*, open Terminal and run the following command to clear the quarantine flag:
   ```bash
   xattr -cr /Applications/KeyFixer.app
   ```
5. Once done, the app is permanently whitelisted and will open instantly in the future.

## Local Build & Commands

To build or run the desktop app locally, ensure you have the Rust toolchain installed.

### Run in Development Mode
```bash
npm run dev:desktop
npm run tauri dev
```

### Build Production DMG Installer
```bash
npm run build:desktop
npm run tauri build
```
The direct-distribution `.dmg` is generated under `src-tauri/target/release/bundle/dmg/`.

### Build the Mac App Store variant

```bash
npm run build:appstore
```

The App Store configuration enables App Sandbox, sets the Utility category, declares export-compliance metadata, and targets macOS 12 or later. A final signed submission also requires the paid team's Apple Distribution certificate, confirmed Team ID, and Mac App Store Connect provisioning profile.

## Architecture

- **Rust Backend (`src-tauri/src/lib.rs`)**: Configures the system tray icon, window lifecycle events (`CloseRequested`, `ExitRequested`), window dragging capabilities, and the macOS Accessory activation policy.
- **React Frontend (`src/components/DesktopApp.tsx`)**: Reuses the core keyboard layout translation mapping with a tailored side-by-side layout, native title bar spacer, and theme preferences listener.
