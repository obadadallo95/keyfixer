# Contributing to KeyFixer

Thank you for your interest in contributing to **KeyFixer**! We welcome bug reports, layout improvement suggestions, documentation fixes, and pull requests.

---

## 🧭 Code of Conduct & Core Principles

1. **100% Offline Guarantee**: We strictly reject any PRs that introduce network calls, analytics SDKs, user telemetry, or remote API dependencies.
2. **Minimal Permissions**: The Chrome Extension must never request broad host permissions (e.g. `<all_urls>`).
3. **Clean Code & Testing**: All new features or layout adjustments must be accompanied by automated Vitest tests.

---

## 🛠️ Local Development Workflow

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/keyfixer.git
   cd keyfixer
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run local development servers**:
   ```bash
   npm run dev              # Web App
   npm run dev:desktop      # Desktop Frontend
   npm run build:extension  # Build Chrome Extension
   ```
4. **Run the test suite**:
   ```bash
   npm run test:run
   ```

---

## ⌨️ Adding or Modifying Keyboard Layouts

All keyboard mapping tables live in `src/core/keyboard/layouts/`:
- `windowsArabic101.ts`: Windows PC Arabic 101 layout.
- `macArabic.ts`: Apple macOS Arabic layout.

When proposing mapping changes:
1. Provide reference documentation or physical keyboard layout photos.
2. Ensure diacritics (Tashkeel) and ligatures (`لا`, `لأ`, `لإ`, `لآ`) remain intact.
3. Update or add corresponding test cases in `tests/keyboardLayoutConverter.test.ts`.

---

## 📬 Pull Request Guidelines

1. **Branch Naming**: Use clear branch names like `fix/ligature-mapping`, `feat/azerty-layout`, `docs/windows-guide`.
2. **Validation Checklist**:
   - [ ] `npm run version:check` passes.
   - [ ] `npm run typecheck` and `npm run typecheck:extension` pass.
   - [ ] `npm run test:run` passes (all 106+ tests).
3. **Descriptive PR**: Explain what was changed, why the change is necessary, and steps to test.
