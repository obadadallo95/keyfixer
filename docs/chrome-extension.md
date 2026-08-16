# Chrome Extension Documentation (v1.3.1)

KeyFixer includes a Manifest V3 bilingual extension for Google Chrome, Microsoft Edge, Brave, and other Chromium-based browsers to instantly correct text typed with the wrong keyboard layout.

---

## 🛒 Chrome Web Store Listing

- **Direct Link**: [**KeyFixer on Chrome Web Store**](https://chromewebstore.google.com/detail/bgleifjaplnanbncododdkgkpaieeafg?utm_source=item-share-cb)
- **Extension ID**: `bgleifjaplnanbncododdkgkpaieeafg`
- **Category**: Productivity / Tools
- **Pricing**: 100% Free

---

## ⚡ User Interface & Experience

- **Popup HUD (`extension/src/popup.ts`, `popup.html`, `popup.css`)**:
  - Responsive compact interface with instant dual textarea conversion as you type or paste.
  - Automatic light/dark mode adaptation matching browser preferences.
  - Embedded bilingual legal disclosures and developer information.
  - Ephemeral in-memory text storage (text is never saved to extension storage or transmitted anywhere).

- **Context Menu Integration**:
  - Right-click selected text on any webpage to reveal KeyFixer actions:
    - `Fix Keyboard Layout`: Replaces the mistyped text directly in-place.
    - `Fix & Copy`: Converts the text and copies the result directly to the clipboard.

- **Smart DOM In-Place Replacement (`extension/src/content.ts`)**:
  - Seamlessly replaces text in standard `<input>`, `<textarea>`, and rich `contenteditable` elements.
  - Interoperable with modern frontend frameworks (React, Vue, Angular) by dispatching native property setters and synthetic `InputEvent` dispatches.
  - Displays an unobtrusive, temporary status toast on successful replacement or copy.

---

## 🔒 Minimum Permissions Model

| Permission | Justification |
| :--- | :--- |
| `contextMenus` | Registers user-facing right-click menu items for selected text. |
| `storage` | Stores user interface language and default conversion direction locally. |
| `clipboardWrite` | Copies converted text to clipboard upon user request. |
| `activeTab` | Grants temporary execution permission on the active tab *only after* explicit user interaction. |
| `scripting` | Executes the replacement helper script on the current page during user-initiated actions. |

> [!IMPORTANT]
> KeyFixer declares **NO host permissions** (`<all_urls>` is excluded). The extension cannot monitor browsing activity, read background traffic, or access pages without direct user action.

---

## 🛠️ Building the Extension

```bash
# Build production extension artifact in extension/dist/
npm run build:extension
```

### Loading Unpacked for Development:
1. Open `chrome://extensions` in Chrome or Edge.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension/dist/` directory.
