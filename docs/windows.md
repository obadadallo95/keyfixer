# Windows Desktop Application (v1.3.1)

KeyFixer for Windows is a native desktop application built with **Tauri v2** and **Rust**, distributed both as a packaged Win32 MSIX app on the **Microsoft Store** and as a standalone NSIS installer.

---

## 🛒 Microsoft Store Release

KeyFixer is published and verified on the **Microsoft Store**:

- **Store Link**: [**Get KeyFixer on Microsoft Store**](https://apps.microsoft.com/detail/9pk3g83gp41d?ocid=webpdpshare)
- **Product ID**: `9PK3G83GP41D`
- **Package Identity**: `ObadaDallo.KeyFixer`
- **Supported OS**: Windows 10 (version 1809+, build 17763+) and Windows 11 (build 22000+)

---

## ⚡ Features & System Behavior

- **Global Shortcut (`Ctrl + Alt + K`)**: Toggle the KeyFixer window instantly from any active Windows application.
- **Windows Arabic 101 Mapping**: Automatically applies the standard PC Windows Arabic 101 physical layout mapping for text transformations.
- **System Tray Integration**: Lives silently in the Windows Taskbar notification area (System Tray). Clicking toggles window visibility; right-clicking reveals the native context menu.
- **Background Mode (Hide on Close)**: Clicking the window close button (`X`) minimizes KeyFixer silently to the tray rather than terminating the process.
- **Windows 11 Native Theme**: Matches Windows light and dark mode automatically using Fluent design principles and dark slate glassmorphism.

---

## 🛠️ Building for Windows

### 1. Build Requirements
- **Node.js**: v22.x+
- **Rust Toolchain**: `stable` (`x86_64-pc-windows-msvc`)
- **Windows SDK**: Windows 10/11 SDK (for `MakeAppx.exe` and `SignTool.exe`)
- **WebView2 Evergreen Runtime**: Pre-installed on Windows 10/11

### 2. Standalone NSIS Installer
```powershell
npm install
npm run build:desktop
npm run build:windows
```
*Output location:* `src-tauri/target/release/bundle/nsis/KeyFixer_1.3.1_x64-setup.exe`

### 3. Microsoft Store MSIX Package
```powershell
npm run build:windows:msix
```
*Output location:* `src-tauri/target/release/bundle/msix/KeyFixer_1.3.1.0_x64.msix`

For full MSIX packaging details, Partner Center identity configuration, and CI workflows, see [docs/microsoft-store-msix.md](microsoft-store-msix.md).
