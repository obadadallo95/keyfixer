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

## Screenshots

The Windows interface is designed for Windows 11 while preserving KeyFixer's amber accent and right-to-left Arabic workflow.

### English to Arabic conversion

The user can explicitly select the conversion direction when it is known.

![KeyFixer for Windows converting English keyboard-layout text to Arabic](assets/windows/english-to-arabic.jpeg)

### Automatic direction detection

Auto Detect chooses the appropriate Arabic or English conversion direction from the entered text.

![KeyFixer for Windows automatically detecting the keyboard-layout conversion direction](assets/windows/auto-detect.jpeg)

### Privacy and terms

The in-app privacy and terms dialog explains the local-only processing model and offers the support route.

![KeyFixer for Windows privacy and terms dialog](assets/windows/privacy-and-terms.jpeg)

## Microsoft Store

The current version (V1) is intended for testing and direct distribution. It has not yet been prepared for Microsoft Store submission. A separate MSIX build and signed configuration will be needed before store publication.
