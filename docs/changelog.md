# Changelog

All notable changes to KeyFixer will be documented in this file.

## [1.0.0] - 2026-07-22

### Core Engine
- Shared TypeScript engine for both Web App and Chrome Extension.
- Windows Arabic 101 and macOS Arabic layout bi-directional mapping.
- Auto-detect direction algorithm based on character composition.
- Full support for ligatures (`لا`, `لأ`, `لإ`, `لآ`) and Tashkeel (diacritics).

### Web App
- Modern dark theme with glassmorphism UI and amber glows.
- Dual textarea real-time layout switcher.
- Audio feedback toggle (Web Audio API click sound).
- Multilingual English & Arabic support with dynamic RTL/LTR direction.

### Chrome Extension
- Manifest V3 compliant build.
- Popup UI for fast text conversion.
- Context menu integration (`Fix Keyboard Layout` & `Fix & Copy`).
- Prototype setter injection for React/Vue controlled component compatibility.
- 100% offline privacy compliance (zero network calls, zero text storage).
