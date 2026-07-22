# KeyFixer Collapsible Floating Window (Document Picture-in-Picture)

## 📌 Overview
KeyFixer features a **Collapsible Document Picture-in-Picture (PiP) Floating Window** that floats on top of all native desktop applications and browser windows across macOS and Windows.

---

## 🚀 How to Open
1. Visit the KeyFixer web application ([https://keyfixer.vercel.app](https://keyfixer.vercel.app)).
2. Click the **"Open Floating KeyFixer"** (or **"فتح KeyFixer العائم"**) button in the top navigation bar.
3. The floating window will open in an always-on-top window.

---

## ↔️ Collapse & Expand Behavior
- **Collapsed State**:
  - Extremely compact horizontal bar (approx. `260 × 54 px`).
  - Displays only the KeyFixer logo, title, Expand button (`Maximize`), and Close button (`X`).
  - Designed to stay silently in any screen corner without obstructing work.
- **Expanded State**:
  - Compact vertical editor HUD (approx. `380 × 420 px`).
  - Contains text input, instant converted output, copy/clear controls, and layout selector.
  - Automatically focuses the input field upon expanding.

---

## ⌨️ Keyboard Shortcuts
- **`Escape`**: Instantly collapses the floating window into a compact pill.
- **`Ctrl + Enter`** / **`Cmd + Enter`**: Copies converted text to clipboard with instant feedback.

---

## 🔒 Privacy & Security
- **100% Offline & Local**: All text conversions take place inside the browser client memory.
- **No Persistence**: Input text is neither stored on disk nor transmitted to any remote servers.
- **Zero Telemetry**: Text content is never recorded or logged.

---

## 🌐 Browser Support & Limitations
- **Supported Browsers**: Google Chrome (v116+), Microsoft Edge (v116+), Opera, and Chromium-based desktop browsers supporting the `Document Picture-in-Picture API`.
- **System Scope**: The floating window floats above all OS desktop apps (Word, WhatsApp, VS Code, Finder, etc.), but text input/output is performed via copy-paste.
- **Lifetime**: The floating window automatically closes if its parent browser tab is closed.
