# Development Guide

This guide covers setting up and developing KeyFixer locally.

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## Commands Overview

| Script | Description |
| --- | --- |
| `npm run dev` | Starts Vite local development server for Web App |
| `npm run build` | Builds production web bundle in `dist/` |
| `npm run build:extension` | Compiles Chrome extension bundle in `extension/dist/` |
| `npm run typecheck` | Runs TypeScript compiler type checking without emitting files |
| `npm run test` | Starts Vitest in watch mode |
| `npm run test:run` | Executes all Vitest unit tests once |

## Directory Layout

```
keyfixer/
├── src/                      # Core Web Application & Shared Engine
│   ├── core/keyboard/        # Conversion engine & layouts
│   ├── components/           # React UI Components
│   └── i18n/                 # Internationalization strings
├── extension/                # Chrome Extension Manifest & Sources
│   ├── src/                  # Background, Content & Popup TypeScript
│   └── assets/               # Extension icons (16, 32, 48, 128)
├── tests/                    # Vitest unit test suite
├── docs/                     # Documentation & specifications
├── experimental/             # Legacy & CLI python prototypes
└── extension-build.js        # Extension build script using esbuild
```
