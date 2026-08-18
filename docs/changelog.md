# Changelog

All notable changes to KeyFixer will be documented in this file. KeyFixer adheres to [Semantic Versioning](https://semver.org/).

---

## [1.3.2] - 2026-08-18

### 🍎 Apple Mac App Store Official Launch & Website UI/UX Redesign
- **Apple Mac App Store Official Publication**:
  - Published on Apple Mac App Store under App ID `6796866841` (`https://apps.apple.com/de/app/keyfixer/id6796866841?mt=12`).
  - Sandboxed Universal macOS binary supporting Apple Silicon (M1–M4) and Intel architectures on macOS 12.0+.
  - Fully integrated StoreKit in-app purchase capabilities and App Sandbox compliance.
- **Complete Website UI/UX Redesign**:
  - Built an immersive hero section with official store announcements and verified store badges.
  - Implemented one-click **Quick Try Preset Chips** for instantaneous testing.
  - Upgraded the interactive converter with frosted glass styling, ambient amber glow, and enhanced stats ticker.
  - Added dedicated **Features & Capabilities** and **Global Shortcuts Guide** showcase.
- **Repository & Quality Assurance**:
  - Expanded automated test coverage to **118 tests** across 15 test suites with 100% passing results.
  - Synchronized all ecosystem versions across `package.json`, `Cargo.toml`, `AppxManifest.xml`, and `manifest.json`.

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
  - Implemented global hotkeys: `⌥ Option + Space` on macOS, `Alt + Shift + X` on Windows.
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

## [1.0.0] - 2026-07-20

### Initial Stable Release
- Core physical keyboard layout mapping engine for Arabic and English layouts.
- Progressive Web Application with client-side zero-latency processing.
- Google Chrome Extension Manifest V3.
- MIT open source license.
