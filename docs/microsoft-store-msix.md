# KeyFixer — Microsoft Store (MSIX)

KeyFixer is available on the Microsoft Store as a packaged Win32 desktop application
distributed as an MSIX package.

---

## Partner Center Identity

These values are embedded in `AppxManifest.xml` and must match Partner Center exactly.
**Do not modify them without updating the corresponding Partner Center submission.**

| Field | Value |
|---|---|
| Package / Identity / Name | `ObadaDallo.KeyFixer` |
| Package / Identity / Publisher | `CN=A2B67C57-E9AA-4233-B229-7A21800FE184` |
| PublisherDisplayName | `Obada Dallo` |
| Package Family Name | `ObadaDallo.KeyFixer_paysbrkxt80tg` |
| Store ID | `9PK3G83GP41D` |

---

## Package Details

| Field | Value |
|---|---|
| Package Version | `1.1.1.0` |
| Architecture | `x64` |
| Target OS | Windows 10 v1809 (RS5, build 17763) or later |
| Max Version Tested | Windows 11 24H2 (build 26100) |
| Application ID | `KeyFixer` |
| Executable | `KeyFixer\keyfixer-desktop.exe` |
| Entry Point | `windows.fullTrustApplication` |
| Capabilities | `runFullTrust` only |
| Minimum OS Rationale | WebView2 Evergreen Runtime requires Windows 10 RS5+ |

---

## Packaging Approach

Tauri v2 does not have a native `msix` bundle target. KeyFixer uses a manual
`MakeAppx.exe` workflow:

1. Tauri compiles the same x64 executable as the NSIS build (no behaviour changes).
2. `scripts/generate-msix-assets.mjs` produces all required MSIX PNG assets from
   `src-tauri/icons/icon_512x512.png` using the `sharp` npm package.
3. `scripts/build-msix.mjs` assembles the staging directory, copies the manifest
   and assets, locates `MakeAppx.exe` via Windows SDK path search, and packs the `.msix`.
4. In CI, an ephemeral self-signed certificate (`CN=A2B67C57-E9AA-4233-B229-7A21800FE184`)
   is created, used to sign the package, and deleted within the same workflow run.
5. Partner Center validates the Publisher identity and re-signs the package with a
   globally trusted Microsoft certificate before distributing it to users.

---

## Build Command

```powershell
# Windows only
npm run build:windows:msix
```

> This also produces the NSIS installer as a side-effect (the `tauri build` step
> is shared). Both outputs are preserved.

---

## Artifact Output

```
src-tauri/target/release/bundle/msix/KeyFixer_1.1.1.0_x64.msix
```

The CI artifact is named **`KeyFixer-Microsoft-Store-MSIX`** and is retained for
90 days after each successful workflow run.

---

## CI/CD Workflow

File: `.github/workflows/microsoft-store-msix.yml`

Triggers on pushes to `feat/microsoft-store-msix` and pull requests to `main`.

Steps in order:
1. Checkout, Node 22.x, Rust stable
2. `npm ci`
3. `npm run typecheck`
4. `npm run typecheck:extension`
5. `npm run test:run`
6. `cargo check`
7. `npm run build:windows:msix`
8. Create ephemeral self-signed certificate
9. Sign with `SignTool.exe`
10. Verify signature
11. Unpack and validate manifest fields
12. Report SHA-256
13. Delete ephemeral certificate
14. Upload artifact `KeyFixer-Microsoft-Store-MSIX`

---

## Local Testing (Windows only)

### Prerequisites
- Windows 10 v1809 or Windows 11
- PowerShell 5.1 or later (pre-installed on Windows)
- Developer mode enabled, **or** a locally trusted certificate

### Install the test certificate (one-time, local machine only)

> ⚠️ This certificate is for local testing **only**. It is not the Microsoft Store
> certificate used for public distribution. Never install untrusted certificates
> on production machines.

In CI, the ephemeral certificate is never exported. For local testing, you must
generate your own certificate with the matching Subject:

```powershell
# Run as Administrator
$cert = New-SelfSignedCertificate `
  -Subject "CN=A2B67C57-E9AA-4233-B229-7A21800FE184" `
  -Type CodeSigningCert `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") `
  -FriendlyName "KeyFixer MSIX local test"

# Export the public certificate (no private key) for installation as trusted root
Export-Certificate `
  -Cert $cert `
  -FilePath "$HOME\Desktop\KeyFixer-test.cer"

# Trust the certificate locally (required for Add-AppxPackage without Dev Mode)
Import-Certificate `
  -FilePath "$HOME\Desktop\KeyFixer-test.cer" `
  -CertStoreLocation "Cert:\LocalMachine\Root"
```

### Sign the package locally

```powershell
$thumbprint = $cert.Thumbprint
$msix = "src-tauri\target\release\bundle\msix\KeyFixer_1.1.1.0_x64.msix"

# Find signtool
$sdkBase = "C:\Program Files (x86)\Windows Kits\10\bin"
$signtool = Get-ChildItem $sdkBase -Recurse -Filter signtool.exe |
            Where-Object { $_.FullName -match "x64" } |
            Sort-Object FullName -Descending |
            Select-Object -First 1 -ExpandProperty FullName

& $signtool sign /sha1 $thumbprint /fd SHA256 $msix
```

### Install the package

```powershell
Add-AppxPackage -Path "src-tauri\target\release\bundle\msix\KeyFixer_1.1.1.0_x64.msix"
```

### Verify installation

```powershell
Get-AppxPackage -Name "ObadaDallo.KeyFixer"
```

Expected output includes:
```
Name              : ObadaDallo.KeyFixer
PackageFamilyName : ObadaDallo.KeyFixer_paysbrkxt80tg
Version           : 1.1.1.0
Architecture      : X64
```

### Uninstall the package

```powershell
$pkg = (Get-AppxPackage -Name "ObadaDallo.KeyFixer").PackageFullName
Remove-AppxPackage -Package $pkg
```

### Clean up test certificate

```powershell
# Remove from trusted roots (run as Administrator)
Get-ChildItem "Cert:\LocalMachine\Root" |
  Where-Object { $_.Subject -like "*A2B67C57*" } |
  Remove-Item

# Remove from personal store
Get-ChildItem "Cert:\CurrentUser\My" |
  Where-Object { $_.Subject -like "*A2B67C57*" } |
  Remove-Item
```

---

## Store Upload Instructions

1. Download the `KeyFixer-Microsoft-Store-MSIX` artifact from the GitHub Actions run.
2. Navigate to [Partner Center](https://partner.microsoft.com/) → **KeyFixer** product.
3. Go to **Submissions** → **New submission**.
4. Under **Packages**, upload `KeyFixer_1.1.1.0_x64.msix`.
5. Partner Center validates:
   - Publisher identity matches `CN=A2B67C57-E9AA-4233-B229-7A21800FE184`
   - Version `1.1.1.0` is new (not previously uploaded)
6. Complete the rest of the submission form (description, screenshots, etc.).
7. Submit for certification.
8. Microsoft applies trusted Store signing; the self-signed CI certificate is replaced.

---

## Version Increment Rule

Every new Store submission **must** use a strictly greater four-part version number
(`Major.Minor.Build.Revision`). The current version is `1.1.1.0`.

For the next submission, update:
1. `src-tauri/msix/AppxManifest.xml` → `Identity Version="1.1.2.0"` (or higher)
2. `scripts/build-msix.mjs` → `const VERSION = '1.1.2.0'` (and `MSIX_FILENAME`)

> [!IMPORTANT]
> The four-part MSIX version is independent of the three-part Tauri / Cargo version.
> `1.1.1.0` → `1.1.2.0` for a patch; `1.2.0.0` for a minor; `2.0.0.0` for major.

---

## Notes on Signing

| Context | Certificate | Who signs |
|---|---|---|
| CI / local test | Self-signed `CN=A2B67C57-...` (ephemeral) | Developer (SignTool) |
| Microsoft Store public release | Microsoft trusted root | Microsoft (automatic) |

The self-signed certificate is **never** committed to the repository. It is created
dynamically in CI and deleted in the same run. No private keys or `.pfx` files are
stored as GitHub Secrets or in any file.

---

## Files Added by This Feature

| File | Purpose |
|---|---|
| `src-tauri/msix/AppxManifest.xml` | Microsoft Store package manifest |
| `scripts/generate-msix-assets.mjs` | Generates required MSIX PNG assets |
| `scripts/build-msix.mjs` | Orchestrates the full MSIX build pipeline |
| `.github/workflows/microsoft-store-msix.yml` | Dedicated CI workflow |
| `docs/microsoft-store-msix.md` | This document |
