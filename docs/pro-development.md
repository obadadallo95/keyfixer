# KeyFixer Pro Development & Architecture Guidelines

## Overview
KeyFixer uses a strict architecture boundary separating the open-source / public Free codebase from proprietary local Pro capabilities.

All proprietary Pro implementation details live locally inside the gitignored directory:

```
pro-private/
  native/
    inline_fix.rs
  frontend/
    provider.ts
    ProPanel.tsx
```

## Security & Repository Rules
1. **`pro-private/` is gitignored**: Never force-add or track files inside `pro-private/` in the public Git repository.
2. **No Commercial Secrets in Tracked Code**: Never commit API keys, private keys, or licensing secrets to public files.
3. **Environment & Keychains**: Future secrets belong in environment variables, OS keychain, or secure CI secret storage.
4. **Public Build Guarantee**: The public codebase MUST always compile cleanly and function fully even when `pro-private/` is completely absent from disk.

## Build Flow & Modes

### 1. Free Build (Default / Public)
```bash
npm run build:desktop
```
- Uses only tracked GitHub code.
- Does not require `pro-private/`.
- Compiles safe no-op fallbacks for Pro contracts.
- Produces current Free KeyFixer behavior.

### 2. Local Pro macOS Build
```bash
npm run build:pro:mac
```
- Detects and enables local `pro-private/` implementation.
- Sets `VITE_PRO_BUILD=true` and Cargo feature `--features pro`.
- Enables macOS Inline Fix (`⌥⌘K`) for local testing.

### 3. Mac App Store Build
```bash
npm run build:appstore
```
- Strictly sandboxed Free build.
- Enforces `appstore` Cargo feature which triggers a compile-time check if `pro` feature is accidentally passed.
- Excludes accessibility injection, CGEvent posting, and Pro native modules.

## How to Restore `pro-private/` Locally
On a new development machine, create `pro-private/` locally or restore from your secure local backup:
```bash
mkdir -p pro-private/native pro-private/frontend
```
`pro-private/` will be automatically gitignored by the root `.gitignore`.
