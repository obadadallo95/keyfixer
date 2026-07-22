# Chrome Web Store Publishing Guide

This guide outlines the steps for packaging and submitting KeyFixer to the Chrome Web Store.

## Checklist Before Publishing

- [x] Manifest V3 compliance verified.
- [x] Extension icons generated in `extension/assets/` (`16x16`, `32x32`, `48x48`, `128x128`).
- [x] Permissions streamlined (`contextMenus`, `storage`, `clipboardWrite`).
- [x] Zero external network requests / privacy policy compliance.
- [x] No persistent storage of user input text (`lastInput` disabled).
- [x] Build script generates clean `extension/dist` artifact without unhandled promises.

## Packaging the Extension

Run the build script to compile TypeScript and copy manifest and assets:

```bash
npm run build:extension
```

To create a ZIP archive for submission:

```bash
cd extension/dist
zip -r ../../keyfixer-extension-v1.0.0.zip .
cd ../..
```

## Store Listing Details

- **Title**: KeyFixer - Arabic English Keyboard Fixer
- **Category**: Productivity / Tools
- **Language**: English / Arabic
- **Privacy Policy**: Link to `https://obadadallo.web.app/privacy` or embedded `docs/privacy.md`.
- **Single Purpose Justification**: Converts mistyped text between English QWERTY and Arabic keyboard layouts.
