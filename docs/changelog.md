# Changelog

All notable changes to KeyFixer will be documented in this file. KeyFixer adheres to [Semantic Versioning](https://semver.org/).

---

## [1.3.1] - 2026-08-17

### Microsoft Store & Chrome Web Store Official Releases
- **Microsoft Store Win32 MSIX App**: Published on Microsoft Store under Product ID `9PK3G83GP41D` (`ObadaDallo.KeyFixer`).
- **Google Chrome Web Store Extension**: Published on Chrome Web Store under Extension ID `bgleifjaplnanbncododdkgkpaieeafg`.
- **Website & Documentation Overhaul**:
  - Added official store badges and live installation cards to the web landing page.
  - Redesigned documentation with animated SVG showcase banner and full bilingual guides.
  - Synchronized all platform manifests (`package.json`, `Cargo.toml`, `manifest.json`, `AppxManifest.xml`, `tauri.conf.json`).

---

## [1.3.0] - 2026-08-16

### Desktop Architecture, StoreKit & Resilience Overhaul
- **StoreKit In-App Purchase Architecture (macOS)**:
  - Added native StoreKit bridge integration for Lifetime Pro and Subscription tiers.
  - Implemented offline activation code verification fallback with secure local caching.
  - Built comprehensive `tests/storeKitArchitecture.test.ts` suite.
- **Windows MSIX Packaging Automation**:
  - Automated `scripts/build-msix.mjs` and asset generation via `sharp` for all required Tile/Logo scales.
  - Added GitHub Actions workflow `.github/workflows/microsoft-store-msix.yml` for automated CI signing and artifact production.
- **Enhanced UI & Audio Feedback**:
  - Implemented synthesized Web Audio API & native macOS audio feedback for copy/paste operations.
  - Integrated onboarding walk-through modal and unified legal viewer across desktop apps.
  - Expanded automated test coverage to 106 tests across 13 test suites.

---

## [1.2.0] - 2026-08-10

### Cross-Platform Desktop Expansion & Floating PiP Window
- **Tauri v2 Desktop App for Windows & macOS**:
  - Built native lightweight background application with system tray integration.
  - Implemented global hotkeys: `⌥⌘K` on macOS, `Ctrl + Alt + K` on Windows.
  - Added "Hide on Close" window lifecycle management.
- **Collapsible Document Picture-in-Picture (PiP)**:
  - Implemented floating HUD window using Chromium's `Document Picture-in-Picture API`.
  - Added collapse to compact pill state (`Escape` key shortcut) and expand to vertical editor.
- **Automated Version Synchronization**:
  - Added `scripts/check-version-sync.mjs` and `scripts/set-version.mjs` to ensure zero drift across all ecosystem manifests.

---

## [1.1.1] - 2026-08-01

### Mac App Store Sandboxing & Polish
- **Mac App Store Submission Preparation**:
  - Added `src-tauri/tauri.appstore.conf.json` with strict App Sandbox entitlements.
  - Removed private accessibility event posting from App Store builds to ensure 100% Apple Developer compliance.
  - Added `scripts/verify-appstore-bundle.sh` for pre-upload validation.
- **Bilingual Legal Documents**:
  - Added full Arabic and English privacy policy, terms of service, and refund disclosures in `docs/legal/`.

---

## [1.1.0] - 2026-07-28

### Global Shortcuts & Monorepo Architecture
- **Global Background Shortcuts**: Registered system-wide hotkeys with rapid double-press debouncing and clipboard state machines.
- **Pro Modular Architecture Boundary**: Separated open-source free engine from optional proprietary local Pro contracts (`pro-private/`).
- **Comprehensive Unit Testing**: Introduced Vitest test suite for keyboard mappings, ligatures, Tashkeel diacritics, and round-trip conversion accuracy.

---

## [1.0.0] - 2026-07-22

### Initial Multi-Platform Release
- **Core Conversion Engine**:
  - Bi-directional translation between English QWERTY and Arabic (Windows 101 & macOS Arabic).
  - Frequency-based automatic direction detection algorithm (`detectConversionDirection.ts`).
  - Full support for Arabic ligatures (`لا`, `لأ`, `لإ`, `لآ`) and Tashkeel.
- **Web Application**:
  - Modern dark glassmorphic UI built with React, Vite, and TailwindCSS.
  - Dual textarea real-time layout switcher with bilingual English/Arabic localization.
- **Chrome Extension (Manifest V3)**:
  - Context menu integration for selected text on any webpage.
  - Compact popup window for immediate text fix.
  - Zero network telemetry guarantee.
