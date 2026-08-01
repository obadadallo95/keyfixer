# Chrome Extension Documentation

KeyFixer includes a bilingual Manifest V3 extension for correcting Arabic and English keyboard-layout mistakes. Text conversion happens locally and the extension makes no network requests.

## User interface

- The popup follows Chrome's compact utility pattern and supports light and dark system themes.
- Arabic or English is selected from Chrome's UI language on first use. A manual language choice is stored locally.
- The popup includes local Privacy, Terms, and Developer views. Only the developer contact button opens the official support page.
- Typed and corrected text exists in the popup session only and is never placed in extension storage.

## Architecture

1. **Popup (`extension/src/popup.ts`, `popup.html`, `popup.css`)**
   - Converts pasted or typed text immediately.
   - Stores only keyboard, conversion-mode, and interface-language preferences.
   - Provides bilingual legal and developer information without network access.

2. **Background service worker (`extension/src/background.ts`)**
   - Registers localized actions for selected text.
   - Converts the selection locally.
   - Injects the page helper only after the user explicitly chooses a KeyFixer context-menu action.

3. **On-demand page helper (`extension/src/content.ts`)**
   - Replaces a selection in an active input, textarea, or content-editable field.
   - Falls back to copying the corrected text when replacement is unavailable.
   - Displays a localized confirmation toast.

## Minimum permissions

- `contextMenus`: add the two user-invoked actions for selected text.
- `storage`: remember keyboard, conversion-mode, and language preferences locally.
- `clipboardWrite`: copy a corrected result after a user request or replacement fallback.
- `activeTab`: grant temporary access to the current page only after the user chooses a KeyFixer action.
- `scripting`: inject the page helper during that temporary, user-initiated access.

The extension declares no host permissions and has no persistent `<all_urls>` content script. It cannot continuously read pages or browsing history.

## Building and loading unpacked

```bash
npm run build:extension
```

Then open `chrome://extensions`, enable Developer Mode, choose **Load unpacked**, and select `extension/dist/`.
