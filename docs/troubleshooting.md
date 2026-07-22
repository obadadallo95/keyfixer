# Troubleshooting Guide

Common issues and resolutions for KeyFixer.

## Chrome Extension Issues

### Extension build fails with `extension/assets` missing
- Ensure you run `python3 scratch/generate_icons.py` or create icon PNGs inside `extension/assets/`.
- Run `npm run build:extension` which automatically copies `extension/assets` to `extension/dist/assets`.

### Extension Toast does not show on a webpage
- Some restricted Chrome pages (e.g. `chrome://`, `chrome-extension://`, Chrome Web Store) block content scripts by browser security policy.
- Test on standard websites like Wikipedia or Google.

### React Input fields do not reflect converted text
- KeyFixer dispatches native property setters (`HTMLInputElement.prototype.value`) along with synthetic `InputEvent` and `change` events.
- Ensure the element is an `<input>`, `<textarea>`, or `contenteditable` node.

## Web App Issues

### Audio Click Sound is silent
- AudioContext requires an initial user interaction (click/keystroke) before playing.
- Click the speaker toggle icon in the controls header to enable sound.
