# KeyFixer – Mac App Store Build Guide

> **Branch**: `fix/v1.1.2-stability`  
> **Version**: 1.1.2  
> **Target**: Mac App Store (sandboxed, signed with 3rd-party Apple Distribution certificate)  
> **Last updated**: 2026-08-07

---

## Prerequisites

Before running any build command, confirm you have the following:

| Requirement | Details |
|---|---|
| macOS 13+ | Required to produce a valid macOS 12+ target bundle |
| Xcode Command Line Tools | `xcode-select --install` |
| Rust stable | `rustup update stable` |
| Node.js 22.x | `node --version` |
| Apple Distribution certificate | "3rd Party Mac Developer Application: Obada Dallo (D84FNM2R2N)" installed in your Keychain |
| Mac Installer Distribution certificate | "3rd Party Mac Developer Installer: Obada Dallo (D84FNM2R2N)" – required for `.pkg` packaging |
| Provisioning profile | `src-tauri/signing/KeyFixer.provisionprofile` (never committed; download from Apple Developer portal) |
| Tauri CLI | Installed via `npm ci` as a dev dependency – no global install needed |

---

## Step 1 – Clean install

```bash
cd /path/to/keyfixer
git checkout fix/v1.1.2-stability
git pull origin fix/v1.1.2-stability

# Install exact dependency tree
npm ci
```

---

## Step 2 – Verify version sync

Confirm all version files are synchronized before building:

```bash
npm run version:check
```

Expected output:
```
Checking version synchronization (Target: 1.1.2, MSIX: 1.1.2.0)...
✅ package-lock.json (1.1.2)
✅ package-lock.json (packages[""]) (1.1.2)
✅ extension/manifest.json (1.1.2)
✅ src-tauri/tauri.conf.json (1.1.2)
✅ src-tauri/Cargo.toml (1.1.2)
✅ src-tauri/Cargo.lock (1.1.2)
✅ src-tauri/msix/AppxManifest.xml (1.1.2.0)

✅ All versions are synchronized.
```

---

## Step 3 – Confirm the provisioning profile is in place

```bash
ls -la src-tauri/signing/KeyFixer.provisionprofile
```

If the file is missing, download it from the Apple Developer portal:
1. Go to https://developer.apple.com/account/resources/profiles/list
2. Download the Mac App Store provisioning profile for `com.obadadallo.keyfixer`
3. Save it as `src-tauri/signing/KeyFixer.provisionprofile`

> **Important**: This file is excluded from git via `.gitignore`. Never commit it.

---

## Step 4 – Run the full App Store build

```bash
npm run build:appstore
```

This single command runs the full deterministic pipeline:

1. `build:appstore:clean` → removes `dist-desktop/` to eliminate any stale artefacts
2. `build:desktop` → compiles TypeScript, runs Vite (outputs `dist-desktop/index-desktop.html` + hashed assets), copies `index-desktop.html` → `dist-desktop/index.html`
3. `preflight:desktop` → validates `dist-desktop/index.html` exists, is non-empty, referenced JS/CSS assets exist, no localhost/http:// references, `desktop-root` mount point present
4. `build:appstore:tauri` → runs `tauri build --bundles app --config src-tauri/tauri.appstore.conf.json` (signs with Apple Distribution identity + embeds provisioning profile)
5. `verify:appstore:postbuild` → validates the signed `.app` bundle: index.html in Resources, bundled assets, no dev-server refs, Info.plist metadata, code signature, App Sandbox entitlement

Expected final output:
```
✅ Mac App Store bundle verification passed: all N check(s) passed.
```

The signed `.app` bundle is at:
```
src-tauri/target/release/bundle/macos/KeyFixer.app
```

---

## Step 5 – Local smoke test (manual, on macOS)

> **Important**: An app signed with the "3rd Party Mac Developer Application" certificate (App Store distribution) **cannot be launched directly** with `open` or from Finder. macOS returns error Code=163 ("Launchd job spawn failed") because this signing identity requires the App Store sandbox environment to run.
>
> This is **normal and expected** — it is not a bug in your build.

### Option A — Quick binary verification (no launch needed)

Run the post-build verifier. It confirms the app is correctly built and signed **without needing to launch it**:

```bash
npm run verify:appstore
```

Expected output:
```
✅ Binary found (N bytes)
✅ Frontend marker 'desktop-root' found embedded in binary
✅ Frontend marker 'index-desktop' found embedded in binary
✅ No dev-server references found embedded in binary
✅ CFBundleIdentifier = com.obadadallo.keyfixer
✅ Code signature valid
✅ com.apple.security.app-sandbox = true
✅ Mac App Store bundle verification passed
```

### Option B — Functional launch test (use a dev-signed local build)

To do a functional UI smoke test locally before submitting, build with the **development** certificate (not the App Store distribution certificate):

```bash
# Build unsigned / ad-hoc signed for local testing only
tauri build --bundles app --config src-tauri/tauri.ci-mac.conf.json

# Then launch it
open src-tauri/target/release/bundle/macos/KeyFixer.app
```

Verify on launch:
- App icon appears in the system tray (menu bar) within 3 seconds
- Press ⌥⌘K (Option+Command+K) to toggle the main window
- The KeyFixer UI renders fully (not a blank window)
- Text conversion works end-to-end

> **Note**: This dev build uses `signingIdentity: "-"` (ad-hoc, not App Store). It is for local UI verification only — **never upload this build to App Store Connect**.

4. **Check the tray menu:**
   - Right-click the menu bar icon
   - Confirm "إظهار KeyFixer (⌥⌘K)" and "إغلاق التطبيق (Quit)" appear

---

## Step 6 – Run post-build verification

```bash
npm run verify:appstore
```

This runs `scripts/verify-appstore-bundle.sh --stage postbuild` and checks:
- KeyFixer.app exists
- Application binary is present and has a reasonable size
- Frontend markers (`desktop-root`, `index-desktop`) are embedded in the binary
- No dev-server references embedded in binary
- Info.plist metadata (bundle ID, category, min macOS, encryption export)
- Code signature validity
- App Sandbox entitlement

> **Note on Resources folder**: In Tauri v2, `Contents/Resources/` only contains `icon.icns`. The HTML/JS/CSS assets are compiled into the binary — this is correct and expected.

---

## Step 7 – Package for upload (`.pkg`)

Tauri produces a `.app` bundle but the Mac App Store requires a `.pkg` installer.  
Use `productbuild` to wrap the signed `.app`:

```bash
# Replace D84FNM2R2N with your Team ID if it ever changes
productbuild \
  --component src-tauri/target/release/bundle/macos/KeyFixer.app \
  /Applications \
  --sign "3rd Party Mac Developer Installer: Obada Dallo (D84FNM2R2N)" \
  KeyFixer-1.1.2.pkg
```

Verify the installer package:
```bash
pkgutil --check-signature KeyFixer-1.1.2.pkg
```

---

## Step 8 – Upload to App Store Connect

Use Transporter (Apple's official upload tool) – **do not use the CI unsigned artifact**:

1. Open **Transporter.app** (download from Mac App Store if not installed)
2. Sign in with your Apple ID (Obada Dallo – D84FNM2R2N)
3. Click **+** and select `KeyFixer-1.1.2.pkg`
4. Click **Deliver**
5. Wait for Transporter to validate and upload the package
6. Monitor App Store Connect for processing status (usually 15–30 minutes)
7. Once processed, submit for review in App Store Connect

---

## Troubleshooting

### Blank window on launch
**Cause**: `dist-desktop/index.html` was missing or stale when Tauri bundled the app.  
**Fix**: Always use `npm run build:appstore` — never call `tauri build` directly for submissions.

### Pre-flight fails with "index.html not found"
**Cause**: `build:desktop` was not run first, or `dist-desktop/` was cleaned without rebuilding.  
**Fix**: The `build:appstore` command handles this automatically. If running steps manually, run `npm run build:desktop` before any Tauri command.

### "CSSMERR_TP_NOT_TRUSTED" in postbuild verification
**Cause**: The Apple Distribution certificate chain is not trusted in your local macOS Keychain.  
**Status**: Non-fatal. The bundle is correctly signed; Transporter will validate the full trust chain during upload.

### Signing identity not found
**Cause**: The Apple Distribution certificate is not in your Keychain.  
**Fix**: Download and install the certificate from https://developer.apple.com/account/resources/certificates/list

### "The application cannot be opened" / Code=163 when running `open KeyFixer.app`
**Cause**: The app is signed with the "3rd Party Mac Developer Application" certificate (App Store distribution identity). macOS requires the App Store sandbox environment to launch such apps — they cannot be launched directly from the filesystem.  
**Status**: This is **normal and expected** for App Store builds.  
**Fix**: Use `npm run verify:appstore` to confirm the build is correct without launching it. For a functional UI test, use the ad-hoc build: `tauri build --bundles app --config src-tauri/tauri.ci-mac.conf.json`.

### Provisioning profile expired or missing
**Cause**: `src-tauri/signing/KeyFixer.provisionprofile` is absent or expired.  
**Fix**: Download a fresh profile from https://developer.apple.com/account/resources/profiles/list and replace the file.

---

## CI vs. Local build

| | CI (GitHub Actions) | Local (for App Store) |
|---|---|---|
| Purpose | Validates build is reproducible | Produces the actual submission |
| Signing | Unsigned (`signingIdentity: "-"`) | Signed (`3rd Party Mac Developer Application: Obada Dallo`) |
| Artifact | Unsigned `.app` for inspection only | Signed `.pkg` for Transporter upload |
| Config | `tauri.ci-mac.conf.json` | `tauri.appstore.conf.json` |
| Command | `npm run build:mac-ci` (called by CI) | `npm run build:appstore` |
| Upload to App Store | ❌ Never | ✅ Yes, via Transporter |

> **Important**: The unsigned CI artifact (`KeyFixer-1.1.2-macos-unsigned-validation`) is for validation only. Never upload it to App Store Connect.
