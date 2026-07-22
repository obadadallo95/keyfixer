# Contributing to KeyFixer

Thank you for considering contributing to KeyFixer!

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Use `npm run dev` for web app development.
4. Use `npm run build:extension` for extension development.

## Tests
All new features or bug fixes must include tests. Run tests with:
`npm run test`

## Keyboard Map Changes
If you find an inaccuracy in a keyboard map (Windows or macOS), please provide documentation or a clear reproduction step. Modify the maps inside `src/core/keyboard/layouts/`. Ensure all tests still pass, or update them accordingly.

## Pull Requests
- Keep PRs focused on a single change.
- Ensure `npm run lint` and `npm run typecheck` pass.
- Provide clear descriptions of the change.
