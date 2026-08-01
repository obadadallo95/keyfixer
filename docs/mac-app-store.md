# Mac App Store Release Guide

This document tracks the release-specific configuration for KeyFixer. Direct-distribution DMG settings remain in `src-tauri/tauri.conf.json`; Mac App Store overrides live in `src-tauri/tauri.appstore.conf.json`.

## Validation

```bash
npm ci
npm run typecheck
npm run test:run
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build:desktop
bash scripts/verify-appstore-bundle.sh
```

The verification script checks an already built, distribution-signed App Store bundle for:

- Bundle ID: `com.obadadallo.keyfixer`
- Category: Utilities
- Minimum macOS: 12.0
- Export-compliance declaration
- App Sandbox entitlement
- Bundle signature integrity

If the local Keychain is missing an Apple intermediate certificate, `codesign` can report `CSSMERR_TP_NOT_TRUSTED`. The script reports that condition as a warning; successful Transporter/App Store Connect validation is still required and is authoritative for the uploaded package.

For local UI testing, use the regular desktop build. Do not ad-hoc re-sign the App Store bundle: sandboxed WebKit helper processes can behave differently from the distribution-signed package.

## Apple Developer prerequisites

Complete these in Certificates, Identifiers & Profiles using the paid Apple Developer team:

1. Paid Team ID: `D84FNM2R2N` (confirmed from the active Individual membership).
2. Register an explicit macOS App ID for `com.obadadallo.keyfixer`.
3. Create and install a Mac App Distribution certificate. Its local signing identity is `3rd Party Mac Developer Application: Obada Dallo (D84FNM2R2N)`.
4. Create a **Mac App Store Connect** distribution provisioning profile linked to that App ID and certificate.
5. Download the profile and embed it at `KeyFixer.app/Contents/embedded.provisionprofile` through the App Store Tauri config.
6. The final entitlements are configured as:
   - `com.apple.application-identifier` = `D84FNM2R2N.com.obadadallo.keyfixer`
   - `com.apple.developer.team-identifier` = `D84FNM2R2N`
7. Sign the app using the Mac App Distribution identity.
8. Package the signed app in a `.pkg` using the Mac Installer Distribution identity required by the selected upload workflow.

Never commit certificates, private keys, downloaded provisioning profiles, App Store Connect API keys, or account credentials.

## App Store Connect record

- Platform: macOS
- Name: KeyFixer
- Bundle ID: `com.obadadallo.keyfixer`
- Primary category: Utilities
- Suggested secondary category: Productivity
- Privacy response: Data Not Collected, after verifying the submitted binary contains no analytics or tracking
- Support URL: `https://obadadallo.web.app/contact/`
- Privacy URL: `https://github.com/obadadallo95/keyfixer/blob/main/docs/privacy.md`
- License agreement: Apple Standard EULA unless a custom agreement is intentionally selected

## Submission status

- Version and build: `1.1.1`
- Submitted: August 1, 2026
- Status: Waiting for Review
- Localization: Arabic (primary)
- Screenshots: three Arabic `1440 × 900` screenshots in `store-assets/app-store/ar/`
- Privacy disclosure: Data Not Collected
- Price: Free
- Availability: Public in 175 countries or regions
- Age rating: 4+
- EU Digital Services Act status: Non-Trader
- Release method: Manual release after approval
