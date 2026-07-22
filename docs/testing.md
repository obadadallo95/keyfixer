# Testing & Quality Assurance

KeyFixer uses [Vitest](https://vitest.dev/) for fast unit testing of the keyboard conversion engine.

## Running Tests

```bash
# Run unit tests once
npm run test:run

# Run unit tests in watch mode
npm run test
```

## Test Coverage Scope

The test suite in [`tests/keyboardLayoutConverter.test.ts`](../tests/keyboardLayoutConverter.test.ts) covers:

1. **Full Key Map Iteration**: Validates every single key in `WIN_EN_TO_AR_MAP`, `WIN_AR_TO_EN_MAP`, `MAC_EN_TO_AR_MAP`, `MAC_AR_TO_EN_MAP`.
2. **Bi-directional Conversion**: English → Arabic & Arabic → English.
3. **Auto-Detection Direction**: Validates frequency-based auto-detect mode.
4. **Special Tokens & Diacritics**: Tashkeel, multi-character ligatures (`لا`, `لأ`, `لإ`, `لآ`).
5. **Whitespace & Newlines**: Multiline text preservation (`\n`).
6. **Emojis & Non-Mapped Characters**: Ensures untouched passthrough of emojis and unrecognized symbols.
7. **Round-Trip Conversions**: Verifies `convert(convert(text))` consistency.
