# KeyFixer Documentation Hub

Welcome to the comprehensive technical documentation for **KeyFixer** (v1.3.1) — the privacy-first Arabic ⇄ English keyboard layout conversion utility across Web, Chrome Extension, Windows Desktop (Microsoft Store), and macOS Desktop.

---

## 📑 Documentation Directory

### 🏗️ Architecture & Core Engine
- [**System Architecture**](./architecture.md): Full architectural overview of the shared core engine, React 19 web layer, Manifest V3 Chrome extension, and Tauri v2 Rust desktop platform.
- [**Keyboard Layouts Mapping**](./keyboard-layouts.md): Detailed keycode conversion tables for Windows Arabic 101 and Apple macOS Arabic layouts, including ligatures and diacritics.
- [**Floating Window (Document PiP)**](./floating-window.md): Specification of the collapsible Document Picture-in-Picture window floating HUD.
- [**Pro Architecture & Security Guidelines**](./pro-development.md): Boundary rules for local proprietary modules vs. public open-source free builds.

### 🪟 Windows Desktop & Microsoft Store
- [**Windows Desktop Application**](./windows.md): Native Windows app overview, background tray mode, global shortcuts (`Ctrl+Alt+K`), and interface specifications.
- [**Microsoft Store MSIX Packaging**](./microsoft-store-msix.md): Complete guide for Win32 MSIX packaging via `MakeAppx.exe`, Partner Center identity (`9PK3G83GP41D`), and CI automated releases.

### 🌐 Google Chrome Extension
- [**Chrome Extension Architecture**](./chrome-extension.md): Manifest V3 service worker, on-demand content script injection, and minimum permission model.
- [**Chrome Web Store Publishing Guide**](./publishing-chrome-web-store.md): Packaging, store metadata, and submission guidelines.

### 🍎 macOS Desktop & Mac App Store
- [**macOS Desktop Application**](./desktop-app.md): Tauri v2 macOS architecture, menu bar accessory mode, and global hotkeys (`⌥⌘K`).
- [**Mac App Store Release Guide**](./mac-app-store.md): Sandbox entitlements, StoreKit IAP integration, signing certificates, and App Store Connect review standards.
- [**Manual App Store Build**](./manual-appstore-build.md): Step-by-step local bundle preparation and codesigning verification.

### 🛠️ Development & Quality Assurance
- [**Development Guide**](./development.md): Local environment setup, prerequisites (Node 22, Rust), monorepo structure, and npm scripts.
- [**Testing & QA Guide**](./testing.md): Automated Vitest test suite breakdown (106 unit & integration tests), test matrix, and release verification.
- [**Troubleshooting Guide**](./troubleshooting.md): Solutions for common setup, packaging, permission, and audio context issues.
- [**Product Roadmap**](./roadmap.md): Completed milestones and planned future features.
- [**Changelog**](./changelog.md): Complete version history from v1.0.0 through v1.3.1.

### ⚖️ Legal & Privacy
- [**Privacy Policy**](./privacy.md): Zero data collection guarantee and local-only processing commitment.
- [**Terms of Use**](./terms.md): Acceptable use, warranty disclaimers, and distribution terms.
- [**Legal Directory**](./legal/): Localized privacy policies, terms, refund policies, and impressum files.
