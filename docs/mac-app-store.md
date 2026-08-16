# Mac App Store Release Guide (v1.3.1)

This guide documents the configuration, Sandboxing requirements, and Apple submission standards for KeyFixer on macOS.

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
# 1. Typecheck and verify test suite
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

- **App Name**: KeyFixer
- **Primary Category**: Utilities
- **Secondary Category**: Productivity
- **Privacy Disclosure**: Data Not Collected (Verified binary has zero analytics/tracking)
- **Support URL**: `https://obadadallo.web.app/contact/`
- **Privacy Policy URL**: `https://keyfixer.vercel.app/privacy`
- **Pricing**: Free tier with optional In-App Purchases (StoreKit)
- **Availability**: Global (175 countries)
