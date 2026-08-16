# KeyFixer — Microsoft Store (MSIX) Guide

KeyFixer is published on the Microsoft Store as a packaged Win32 desktop application distributed in the `.msix` format.

---

## 🛒 Live Store Listing

- **Direct Store URL**: [https://apps.microsoft.com/detail/9pk3g83gp41d?ocid=webpdpshare](https://apps.microsoft.com/detail/9pk3g83gp41d?ocid=webpdpshare)
- **Store ID**: `9PK3G83GP41D`
- **Publisher**: `Obada Dallo`

---

## 🔑 Partner Center Identity

These identity values are embedded in `src-tauri/msix/AppxManifest.xml` and match the active Partner Center submission:

| Field | Value |
| :--- | :--- |
| **Package / Identity / Name** | `ObadaDallo.KeyFixer` |
| **Package / Identity / Publisher** | `CN=A2B67C57-E9AA-4233-B229-7A21800FE184` |
| **PublisherDisplayName** | `Obada Dallo` |
| **Package Family Name** | `ObadaDallo.KeyFixer_paysbrkxt80tg` |
| **Store ID / Product ID** | `9PK3G83GP41D` |

---

## 📦 Package Specification (v1.3.1.0)

| Specification | Details |
| :--- | :--- |
| **MSIX Version** | `1.3.1.0` (4-part Quad format) |
| **Target Architecture** | `x64` |
| **Target OS** | Windows 10 v1809 (build 17763) or later |
| **Max Version Tested** | Windows 11 24H2 (build 26100) |
| **Application ID** | `KeyFixer` |
| **Executable Entry Point** | `KeyFixer\keyfixer-desktop.exe` |
| **Capabilities** | `runFullTrust` only |
| **Runtime Dependency** | Microsoft WebView2 Evergreen Runtime |

---

## ⚙️ Automated Packaging Pipeline

Tauri v2 compiles native Win32 binaries. The MSIX packaging is orchestrated by `scripts/build-msix.mjs`:

1. **Asset Generation (`scripts/generate-msix-assets.mjs`)**:
   Produces all required square tiles, wide tiles, store logos, and badge assets across all scale factors (`scale-100`, `scale-150`, `scale-200`, `scale-400`) from the source 512×512 icon.
2. **Staging Directory Assembly**:
   Copies the compiled release binary, WebView2 dependencies, manifest, and assets into `src-tauri/target/msix-staging/`.
3. **MakeAppx Execution**:
   Locates the Windows SDK `MakeAppx.exe` and packages the directory into `KeyFixer_1.3.1.0_x64.msix`.
4. **CI Automated Signing**:
   In GitHub Actions (`.github/workflows/microsoft-store-msix.yml`), a self-signed staging certificate is generated and attached to validate package integrity before upload. Microsoft Store re-signs the package with a globally trusted Microsoft certificate during ingestion.

---

## 🚀 Build Command

```powershell
# Build Windows MSIX Package
npm run build:windows:msix
```

Package output: `src-tauri/target/release/bundle/msix/KeyFixer_1.3.1.0_x64.msix`
