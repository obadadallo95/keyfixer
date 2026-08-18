# Mac App Store Release Guide (v1.3.2)

This guide documents the official publication, Sandboxing configuration, StoreKit architecture, and Apple standards for **KeyFixer** on macOS.

---

## 🍎 Official App Store Publication

- **App Name**: KeyFixer
- **App ID**: `6796866841`
- **Store URL**: [https://apps.apple.com/de/app/keyfixer/id6796866841?mt=12](https://apps.apple.com/de/app/keyfixer/id6796866841?mt=12)
- **Bundle Identifier**: `com.obadadallo.keyfixer`
- **Primary Category**: Utilities
- **Secondary Category**: Productivity
- **Architecture**: Universal (Apple Silicon M1/M2/M3/M4 + Intel x86_64)
- **Minimum macOS Version**: macOS 12.0 (Monterey) or later

---

## 🔒 Security & App Sandbox Configuration

Mac App Store builds require strict App Sandbox enforcement:
- Base Tauri configuration: `src-tauri/tauri.conf.json`
- Mac App Store override configuration: `src-tauri/tauri.appstore.conf.json`

### Active Entitlements
- `com.apple.security.app-sandbox`: Enabled (`true`)
- `com.apple.security.network.client`: Disabled (100% offline app)
- `com.apple.security.network.server`: Disabled
- `com.apple.security.files.user-selected.read-only`: Disabled
- `com.apple.security.temporary-exception.shared-preference.read-only`: Disabled

---

## 🧪 Pre-Flight Validation Commands

```bash
# 1. Typecheck and verify test suite (118 tests)
npm run typecheck
npm run test:run

# 2. Build Mac App Store bundle
npm run build:appstore

# 3. Verify App Store bundle integrity
bash scripts/verify-appstore-bundle.sh --stage postbuild
```

The verification script checks:
- Bundle Identifier: `com.obadadallo.keyfixer`
- Category: `public.app-category.utilities`
- Minimum OS: `12.0`
- ITSAppUsesNonExemptEncryption: `false` (No proprietary encryption)
- Sandbox entitlement presence

---

## 📋 App Store Connect Metadata

- **Privacy Disclosure**: Data Not Collected (Verified binary has zero telemetry, zero tracking, zero external network calls)
- **Support URL**: `https://obadadallo.web.app/contact/`
- **Privacy Policy URL**: `https://keyfixer.vercel.app/privacy`
- **Pricing**: Free tier with optional In-App Purchases (StoreKit Pro Tier)
- **Availability**: Global (175 countries)
