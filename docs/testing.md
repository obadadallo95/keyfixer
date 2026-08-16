# Testing & Quality Assurance Guide (v1.3.1)

KeyFixer implements an automated testing strategy powered by [Vitest](https://vitest.dev/) to ensure 100% conversion accuracy, platform compatibility, and regression prevention.

---

## 🧪 Running the Test Suite

```bash
# Run all tests once with full reporting
npm run test:run

# Run tests in interactive watch mode during development
npm run test

# Run TypeScript compiler checks across test files
npm run typecheck:tests
```

---

## 📊 Test Suite Coverage (106 Tests / 13 Suites)

| Test Suite File | Tests | Focus Area |
| :--- | :---: | :--- |
| `tests/keyboardLayoutConverter.test.ts` | 30 | Full keymap coverage, ligatures (`لا`, `لأ`, `لإ`, `لآ`), diacritics (Tashkeel), auto-detect direction, round-trip conversions |
| `tests/storeKitArchitecture.test.ts` | 19 | macOS StoreKit In-App Purchase bridge, transaction states, offline activation code fallback |
| `tests/microsoftStoreArchitecture.test.ts` | 14 | Windows MSIX manifest rules, Partner Center identity (`9PK3G83GP41D`), versioning constraints |
| `tests/frontend.test.tsx` | 11 | ConverterArea state machine, clipboard read/write handling, debounce protection, double-press prevention |
| `tests/startupResilience.test.tsx` | 8 | Resilient desktop startup, missing platform APIs fallback, audio context gracefulness |
| `tests/websiteLegalRoutes.test.tsx` | 7 | Dynamic web routing for Privacy, Terms, Refund, Impressum, and About Developer pages |
| `tests/legalViewer.test.tsx` | 6 | In-app bilingual legal modal, document switching, RTL layout support |
| `tests/extensionContent.test.ts` | 3 | Chrome Extension DOM input replacement, React controlled component prototype setters, toast triggers |
| `tests/shortcutReleaseArchitecture.test.ts` | 3 | Global shortcut release pipeline and modifier key safety |
| `tests/desktopLongText.test.tsx` | 2 | Large input text rendering (1500+ characters), multiline scrolling bounds, performance |
| `tests/onboarding.test.tsx` | 1 | First-run onboarding flow, storage persistence, and dismissal |
| `tests/proInlineFix.test.tsx` | 1 | Pro contract fallback behavior when proprietary modules are absent |
| `tests/proProvider.test.ts` | 1 | Pro licensing provider state initialization |

---

## 🛡️ Key Testing Principles

1. **Deterministic Conversion**: Core conversion functions are pure with zero side effects.
2. **Offline Memory Isolation**: Tests verify that no external network calls or telemetry events are fired.
3. **Controlled Component Interoperability**: Validates that DOM mutations trigger synthetic `InputEvent` dispatches so React/Vue/Angular controlled inputs properly recognize converted values.
4. **Version Parity**: Tests guarantee that all manifest files stay in exact semver lockstep.
