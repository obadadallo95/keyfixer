# Chrome Extension Documentation

KeyFixer includes a Manifest V3 Chrome Extension that allows users to instantly fix mistyped keyboard layout text anywhere on the web.

## Architecture

The extension consists of three components:

1. **Popup Interface (`extension/src/popup.ts` & `popup.html`)**:
   - Clean, lightweight popup window triggered by clicking the extension icon.
   - Converts typed or pasted text on the fly.
   - Saves layout (`windows` / `mac`) and mode (`auto` / `en2ar` / `ar2en`) preferences in `chrome.storage.local`.
   - Never logs or stores typed text to preserve privacy.

2. **Background Service Worker (`extension/src/background.ts`)**:
   - Registers context menu items:
     - `🔤 Fix Keyboard Layout (KeyFixer)`
     - `📋 Fix & Copy to Clipboard`
   - Listens for selection context menu clicks and dispatches messages to the content script.

3. **Content Script (`extension/src/content.ts`)**:
   - Handles text selection replacement directly in active input elements, textareas, and contenteditable fields.
   - Dispatches native `input` and `change` synthetic events along with prototype value setters for React/Angular/Vue controlled input compatibility.
   - Displays toast feedback without exposing raw user text.

## Permissions Rationale

- `contextMenus`: Required to add right-click options for selected text.
- `storage`: Required to save user layout and mode preferences locally.
- `clipboardWrite`: Required to copy converted text to clipboard when inline replacement is requested or fallback is needed.
- `content_scripts` (`<all_urls>`): The content script runs on web pages (`<all_urls>`) solely to enable instant text selection replacement inside active input fields upon an explicit context menu action by the user. It never reads, stores, logs, or transmits page content.

## Building & Loading Unpacked

```bash
npm run build:extension
```
Load the `extension/dist/` directory in `chrome://extensions/` under Developer Mode.

