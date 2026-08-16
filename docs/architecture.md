# KeyFixer System Architecture (v1.3.1)

KeyFixer is engineered as a modular, high-performance monorepo application. The core algorithmic engine is completely decoupled from UI renderers and platform-specific native hosts.

---

## High-Level Topology

```
                               ┌────────────────────────────────┐
                               │       Shared Core Engine       │
                               │       src/core/keyboard/       │
                               │  - Windows Arabic 101 Mapping  │
                               │  - Apple macOS Arabic Mapping  │
                               │  - Direction Detection Engine  │
                               │  - Tashkeel & Ligature Parser  │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │                               │                               │
 ┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐
 │    React 19 Web App       │   │  Manifest V3 Extension    │   │   Tauri v2 Desktop App    │
 │    src/components/        │   │    extension/src/         │   │   src-tauri/ & DesktopApp │
 │  - Real-time conversion   │   │  - Background worker      │   │  - Rust Native Host       │
 │  - Document PiP HUD       │   │  - Selection script       │   │  - Global Hotkeys         │
 │  - Synthesized Audio      │   │  - Context Menu API       │   │  - System Tray Daemon     │
 │  - Multi-lingual i18n     │   │  - Zero Host Permissions  │   │  - MSIX / StoreKit bridge │
 └───────────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
```

---

## 1. Core Engine Layer (`src/core/keyboard/`)

The core engine is written in pure TypeScript with zero external runtime dependencies.

### Layout Conversion Maps (`layouts/`)
- **`windowsArabic101.ts`**: Complete bidirectional mapping between standard US QWERTY and Microsoft Windows Arabic 101 layout. Handles shifted keys, special symbols, and combined ligature representations (`لا`, `لأ`, `لإ`, `لآ`).
- **`macArabic.ts`**: Bidirectional mapping for the native Apple macOS Arabic physical layout.

### Smart Direction Auto-Detection (`detectConversionDirection.ts`)
- Analyzes character density in the input stream (Arabic Unicode block vs. Latin ASCII block).
- Resolves ambiguous strings (e.g. whitespace, numerals, punctuations) by weighing neighboring directional characters.

### Pure Conversion Function (`keyboardLayoutConverter.ts`)
- Deterministic, synchronous transformation function `convertKeyboardLayout(text, options)`.
- Performance: Executes in less than 1ms for typical paragraphs with zero heap allocations outside the string buffer.

---

## 2. Web Application & PWA (`src/`)

- **UI Framework**: React 19 with Tailwind CSS v4 and modern Lucide icons.
- **Document Picture-in-Picture (PiP)**: Implements Chromium's `Document Picture-in-Picture API` to spawn an always-on-top collapsible floating HUD window across native desktop applications.
- **Audio Feedback**: Synthesized keyboard clicks using the browser Web Audio API (`AudioContext`).
- **SEO & Social**: Pre-rendered Open Graph cards, dynamic canonical routing, and schema.org `SoftwareApplication` JSON-LD metadata.

---

## 3. Google Chrome Extension (`extension/src/`)

- **Manifest V3 Architecture**:
  - `popup.ts`: Lightweight popup interface for manual typing/pasting.
  - `background.ts`: Service worker managing context menu registration and command routing.
  - `content.ts`: User-initiated on-demand DOM injection that updates active inputs (supporting React/Vue controlled component setters) and delivers non-intrusive status toasts.
- **Privacy Model**: Requests zero host permissions (`<all_urls>` is excluded). Operates only on `activeTab` after explicit user invocation.

---

## 4. Tauri v2 Desktop Platform (`src-tauri/`)

- **Rust Host (`src-tauri/src/lib.rs`)**:
  - Configures system tray with native context menu (Show / Quit).
  - Listens to window lifecycle events (`CloseRequested`) to implement background accessory mode.
  - Registers global shortcuts:
    - **macOS**: `⌥⌘K` (Option + Command + K)
    - **Windows**: `Ctrl + Alt + K`
- **Windows MSIX Packaging (Microsoft Store)**:
  - Generates packaged Win32 MSIX app using `MakeAppx.exe` and `AppxManifest.xml`.
  - Publishes under Partner Center ID `9PK3G83GP41D`.
- **macOS Sandboxing & StoreKit**:
  - Sandboxed App Store configuration (`tauri.appstore.conf.json`).
  - Native StoreKit IAP transaction verification for Pro licensing.

---

## 5. Security & Privacy Guarantees

1. **100% Offline Processing**: No user keystrokes, text inputs, or outputs are ever transmitted over the network.
2. **Zero Persistent Storage of Text**: Text is held in ephemeral component state only and discarded on window close or clear.
3. **No Third-Party Analytics**: No Google Analytics, telemetry beacons, or advertising SDKs.
