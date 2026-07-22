# KeyFixer System Architecture

KeyFixer is structured as a modular TypeScript monorepo-style application that decouples core layout conversion logic from UI and platform-specific integrations (Web App & Chrome Extension).

## Architectural Overview

```
                          ┌──────────────────────────┐
                          │   Shared Core Engine     │
                          │ src/core/keyboard/       │
                          └────────────┬─────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
   ┌────────────▼─────────────┐                 ┌─────────────▼────────────┐
   │     Vite React Web App    │                 │ Manifest V3 Chrome Ext.  │
   │ src/components/ & App.tsx │                 │ extension/src/           │
   └──────────────────────────┘                 └──────────────────────────┘
```

## 1. Core Keyboard Engine (`src/core/keyboard/`)

- **Layout Mappings (`layouts/`)**:
  - `windowsArabic101.ts`: Bi-directional key map for standard PC Windows (Arabic 101). Automatically generates reverse map including ligature tokens (`لا`, `لأ`, `لإ`, `لآ`).
  - `macArabic.ts`: Bi-directional key map for Apple macOS Arabic layout.

- **Auto-Detection (`detectConversionDirection.ts`)**:
  - Calculates character frequency density in the input string to choose `en2ar` vs `ar2en`.

- **Conversion Logic (`keyboardLayoutConverter.ts`)**:
  - Pure function `convertKeyboardLayout(text, options)` that transforms text, counts modified characters, and performs synchronous local conversion with negligible latency for normal text inputs.


## 2. Web Application (`src/`)

- Built with React 19, Vite, and TailwindCSS v4.
- Provides real-time instant conversion as users type.
- Supports bilingual English/Arabic UI with dynamic RTL/LTR rendering.

## 3. Chrome Extension (`extension/src/`)

- **Manifest V3** compliant.
- `background.ts`: Service worker managing Context Menu items.
- `content.ts`: Injected script handling selection replacement and clipboard copy notifications. Supports React controlled inputs via prototype setters.
- `popup.ts`: Light, responsive popup UI for quick conversion.

## Privacy & Security Guarantees
- 100% offline, zero network requests.
- No remote analytics or external telemetry.
- No persistent storage of typed input.
