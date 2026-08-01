# Windows Desktop Application

KeyFixer includes a Windows desktop application that builds as a native executable with an NSIS installer via Tauri.

## Build Requirements

- Rust (latest stable)
- Node.js 22.x
- Windows 10/11 for native compilation (or a suitable cross-compilation environment)

## Building for Windows

Run the following command to build the Windows NSIS installer:

```bash
npm install
npm run build:desktop
npm run build:windows
```

The resulting NSIS installer will be located at:
`src-tauri/target/release/bundle/nsis/`

## Features & Behavior

- **Global Shortcut:** `Ctrl+Alt+K` toggles the application from anywhere.
- **Keyboard Layout:** The Windows app automatically uses the **Windows Arabic 101** mapping for text conversions.
- **System Tray:** A tray icon is provided. Clicking it toggles the main window. You can also right-click to show the window or quit the app.
- **Background Mode:** Closing the window hides it in the background instead of quitting. Use the tray menu to quit fully.

## Microsoft Store

The current version (V1) is intended for testing and direct distribution. It has not yet been prepared for Microsoft Store submission. A separate MSIX build and signed configuration will be needed before store publication.
