# KeyFixer Product Roadmap

This document outlines completed milestones and future enhancements for KeyFixer.

---

## ✅ Completed Milestones

### v1.0.0 — Foundations & Web / Chrome Extension
- [x] Shared pure TypeScript conversion engine with physical key layout mapping.
- [x] Support for Windows Arabic 101 and Apple macOS Arabic layouts.
- [x] Character-frequency automatic direction detection algorithm.
- [x] Support for ligatures (`لا`, `لأ`, `لإ`, `لآ`) and Tashkeel diacritics.
- [x] Modern responsive React Web Application with dark glassmorphism styling.
- [x] Manifest V3 Google Chrome Extension with context menu support.

### v1.1.0 & v1.1.1 — macOS Desktop & Sandboxing
- [x] Native Tauri v2 macOS Desktop application.
- [x] Global background shortcut `⌥⌘K` with rapid debounce protection.
- [x] System tray accessory mode (runs in background without Dock clutter).
- [x] Mac App Store Sandboxing compliance and App Store Connect package preparation.

### v1.2.0 — Windows MSIX & Floating Picture-in-Picture
- [x] Native Windows Desktop App with `Ctrl + Alt + K` global hotkey.
- [x] Automated Win32 MSIX packaging for Microsoft Store via `MakeAppx.exe`.
- [x] Collapsible Document Picture-in-Picture (PiP) floating HUD window.
- [x] Automated version synchronization tooling across all 7 manifests.

### v1.3.0 & v1.3.1 — Official Store Releases & Architecture Hardening
- [x] Published on **Microsoft Store** (Product ID: `9PK3G83GP41D`).
- [x] Published on **Google Chrome Web Store** (ID: `bgleifjaplnanbncododdkgkpaieeafg`).
- [x] StoreKit In-App Purchase integration for macOS desktop builds.
- [x] Comprehensive 106-test QA suite across all platform contracts.
- [x] Modernized documentation with animated SVG showcase banner and full bilingual guides.

---

## 🔮 Future Roadmap (v1.4.0+)

### Platform & Layout Expansions
- [ ] **Additional Keyboard Layouts**: French AZERTY ↔ Arabic, German QWERTZ ↔ Arabic.
- [ ] **Custom Mapping Editor**: User-configurable key replacement tables for specialized regional layouts.
- [ ] **Linux Packaging**: Flatpak / AppImage bundles for Ubuntu, Fedora, and Arch.

### User Experience & Power Features
- [ ] **Enhanced Floating HUD**: User-customizable opacity and docking presets.
- [ ] **Contextual Auto-Fix Daemon**: Optional accessibility-assisted inline text replacement on Windows/macOS.
- [ ] **Local Snippet Vault**: Optional, local-only template expansion for frequently used bilingual phrases.
