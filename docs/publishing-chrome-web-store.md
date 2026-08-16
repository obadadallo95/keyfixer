# Chrome Web Store Publishing Guide

This guide outlines packaging and publishing workflows for KeyFixer on the Google Chrome Web Store.

---

## 🛒 Store Details

- **Published Store URL**: [https://chromewebstore.google.com/detail/bgleifjaplnanbncododdkgkpaieeafg?utm_source=item-share-cb](https://chromewebstore.google.com/detail/bgleifjaplnanbncododdkgkpaieeafg?utm_source=item-share-cb)
- **Extension Item ID**: `bgleifjaplnanbncododdkgkpaieeafg`
- **Primary Category**: Productivity
- **Target Audience**: Bilingual Arabic & English users worldwide

---

## 📦 Packaging Workflow

### 1. Build Extension Artifact
```bash
npm run build:extension
```
This script runs TypeScript typechecking, compiles source code via esbuild, and populates `extension/dist/`.

### 2. Create Submission ZIP Archive
```bash
cd extension/dist
zip -r ../../keyfixer-extension-v1.3.1.zip .
cd ../..
```

---

## 📋 Release Checklist

- [x] **Manifest V3 Strict Compliance**: Service worker lifecycle handling, zero remote code execution.
- [x] **High-Resolution Icons**: Generated PNG icons (`16x16`, `32x32`, `48x48`, `128x128`) in `extension/assets/`.
- [x] **Zero Host Permissions**: No `<all_urls>` declarations; only `activeTab` on user trigger.
- [x] **Zero Remote Analytics**: 100% offline text transformation engine.
- [x] **Single Purpose Description**: Converts mistyped text between English QWERTY and Arabic keyboard layouts.
- [x] **Privacy Policy Verification**: Linked to `https://keyfixer.vercel.app/privacy`.
