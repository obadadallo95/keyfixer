# Development Guide (v1.3.1)

This guide covers setting up, developing, testing, and building KeyFixer across Web, Extension, Windows, and macOS targets.

---

## 🛠️ Prerequisites

- **Node.js**: `v22.x` or higher (recommended: LTS)
- **npm**: `v10.x` or higher
- **Rust Toolchain**: `stable` (for Tauri v2 desktop compilation)
- **Platform-Specific SDKs**:
  - **Windows**: Windows 10/11 SDK (`MakeAppx.exe` for MSIX packaging) & WebView2 Runtime.
  - **macOS**: Xcode Command Line Tools & macOS 12+ SDK.

---

## 🚀 NPM Scripts Overview

### Development
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local dev server for the Web Application (port 5173) |
| `npm run dev:desktop` | Starts Vite dev server configured for the Tauri desktop frontend |
| `npm run tauri dev` | Starts native Tauri desktop app in development mode |
| `npm run dev:pro:mac` | Starts macOS desktop app with local Pro features enabled |

### Production Builds
| Command | Description |
| :--- | :--- |
| `npm run build:web` | Builds the production Web App bundle in `dist/` |
| `npm run build:extension` | Compiles Manifest V3 Chrome Extension bundle into `extension/dist/` |
| `npm run build:desktop` | Builds production frontend assets for Tauri in `dist-desktop/` |
| `npm run build:windows` | Builds native Windows NSIS installer via Tauri |
| `npm run build:windows:msix` | Generates signed Windows MSIX package for Microsoft Store |
| `npm run build:appstore` | Prepares and builds sandboxed macOS package for Mac App Store |

### Quality Assurance & Version Management
| Command | Description |
| :--- | :--- |
| `npm run test` | Runs Vitest in interactive watch mode |
| `npm run test:run` | Executes all 106 automated tests once |
| `npm run typecheck` | Validates TypeScript types across web and core engine |
| `npm run typecheck:extension` | Validates TypeScript types for Chrome Extension |
| `npm run typecheck:tests` | Validates TypeScript types across the test suite |
| `npm run version:check` | Verifies version synchronization across all 7 manifest files |
| `npm run version:set -- <ver>` | Updates version synchronously across all manifests |
| `npm run release:check` | Runs the full pre-flight verification pipeline |

---

## 📁 Repository Directory Structure

```
keyfixer/
├── assets/                   # Repository presentation assets & animated SVG banner
├── docs/                     # Comprehensive technical documentation & guides
│   ├── legal/                # Bilingual privacy, terms, and refund documents
│   └── releases/             # Release notes and verification packs
├── extension/                # Manifest V3 Chrome Extension
│   ├── assets/               # Chrome Extension icons (16, 32, 48, 128)
│   ├── manifest.json         # Extension manifest V3 declaration
│   └── src/                  # Background, content script, and popup sources
├── public/                   # Static web assets (logos, favicons, robots.txt, sitemap)
├── scripts/                  # Build automation & validation scripts
│   ├── build-msix.mjs        # Windows MSIX packaging script
│   ├── check-version-sync.mjs# Version synchronization validator
│   ├── generate-msix-assets.mjs # High-res MSIX asset generator
│   ├── set-version.mjs       # Atomic multi-file version updater
│   └── verify-appstore-bundle.sh # App Store bundle entitlement verifier
├── src/                      # Web App & Desktop UI source code
│   ├── components/           # React 19 UI components
│   ├── core/keyboard/        # Shared pure keyboard conversion engine
│   ├── i18n/                 # Localization dictionaries (English & Arabic)
│   ├── legal/                # In-app legal content renderers
│   └── types.ts              # Global TypeScript declarations
├── src-tauri/                # Tauri v2 Native Rust Backend
│   ├── Cargo.toml            # Rust dependencies & metadata
│   ├── msix/                 # MSIX AppxManifest.xml & store config
│   ├── src/lib.rs            # Rust tray, hotkeys, and sound engine
│   └── tauri.conf.json       # Base Tauri v2 configuration
├── store-assets/             # App Store & Microsoft Store screenshots & icons
└── tests/                    # 13 Vitest test suites (106 unit & integration tests)
```
