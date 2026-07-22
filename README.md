<p align="center">
  <img src="public/logo.svg" alt="KeyFixer Logo" width="300" />
</p>

# ⌨️ KeyFixer - Multi-Platform Keyboard Layout Switcher & AI Translator

<p dir="auto" align="center">
  <img src="https://img.shields.io/badge/KeyFixer-v1.0.0-0284c7?style=for-the-badge&logo=typescript&logoColor=white" alt="Version">
  <img src="https://img.shields.io/badge/Architecture-Clean%20Architecture-059669?style=for-the-badge&logo=clean-code&logoColor=white" alt="Clean Architecture">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Chrome%20Ext%20%7C%20Python%20Desktop-7c3aed?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Multi Platform">
  <img src="https://img.shields.io/badge/License-MIT-e11d48?style=for-the-badge" alt="License">
</p>

---

## 🌟 Problem Statement & Vision

Arabic/English typists frequently type text in Arabic while their system keyboard layout is mistakenly set to English QWERTY, resulting in gibberish like:

> **"lhpl hggi"** instead of **"الحمد لله"**
> or vice versa:
> **"اثممخ"** instead of **"hello"**

**KeyFixer** solves this problem instantly with zero-latency, offline physical key mapping. Additionally, it features an independent, modular Translation Engine service (Arabic <-> English) built with **Clean Architecture**, fully decoupled from physical layout mapping logic.

---

## 📐 Clean Architecture Blueprint

The codebase strictly enforces Clean Architecture boundaries:

```
                  ┌──────────────────────────────────────────────┐
                  │              PRESENTATION LAYER              │
                  │  Web App  │  Chrome Ext  │  Desktop Script   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │               USE CASES LAYER                │
                  │  FixKeyboardLayoutUseCase                    │
                  │  TranslateTextUseCase (Decoupled Interface)  │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             INFRASTRUCTURE LAYER             │
                  │  GeminiTranslator (Express Server Proxy)     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │                 DOMAIN LAYER                 │
                  │  KeyMap Tables  │  ITranslator Contracts     │
                  └──────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Physical Layout Switcher (`/core/use-cases/FixKeyboardLayoutUseCase.ts`)**:
   - Bi-directional QWERTY <-> Arabic physical mapping.
   - Covers all letters, shift-states, diacritics (Fatha, Damma, Kasra, Sukun, Shadda), punctuation, and numbers.
   - Auto-detects input direction (LTR vs RTL).
   - 100% Offline & 0ms latency.

2. **Decoupled AI Translator (`/core/use-cases/TranslateTextUseCase.ts`)**:
   - Independent modular translation service contract (`ITranslatorService`).
   - Powered by Gemini 3.6 Flash server-side model (`/api/translate`).

3. **Chrome Extension (Manifest V3)**:
   - Highlight any text on any website -> Right-click -> **"Fix Keyboard Layout (KeyFixer)"**.
   - Replaces text directly inside text inputs or displays a floating toast banner.

4. **Desktop Utility Script (Python)**:
   - Standalone `keyfixer.py` using `pyperclip` and global hotkey listeners (`Ctrl+Alt+K` / `Cmd+Shift+K`).

---

## 💻 Installation & Usage

### 1. Web Application
```bash
# Clone repository
git clone https://github.com/obadadallo95/keyfixer.git
cd keyfixer

# Install dependencies
npm install

# Start full-stack dev server (port 3000)
npm run dev
```

### 2. Chrome Extension (Manifest V3)
1. Navigate to `chrome://extensions` in Google Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `/public/chrome-extension` directory.
4. Highlight any mistyped text on any webpage and right-click to fix!

### 3. Desktop Python Hotkey Listener
```bash
# Install dependencies
pip install pyperclip keyboard pynput

# Run listener script
python keyfixer.py
```
*Press `Ctrl+Alt+K` (or `Cmd+Shift+K` on Mac) after copying mistyped text to fix it seamlessly.*

---

## 👨‍💻 Developer Profile & Credits

KeyFixer was conceptualized, designed, and engineered by **Obada Dallo (عبادة دللو)**.

<p align="center">
  <a href="https://obadadallo.web.app/">
    <img src="https://img.shields.io/badge/Portfolio-obadadallo.web.app-0284c7?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio">
  </a>
  <a href="https://www.linkedin.com/in/obada-dallo-777a47a9/">
    <img src="https://img.shields.io/badge/LinkedIn-Obada%20Dallo-0077b5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://github.com/obadadallo95">
    <img src="https://img.shields.io/badge/GitHub-obadadallo95-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>

- **Name**: Obada Dallo (عبادة دللو)
- **Role**: Senior Full-Stack Developer, System Architect & Extension Engineer
- **Portfolio**: [https://obadadallo.web.app/](https://obadadallo.web.app/)
- **LinkedIn**: [https://www.linkedin.com/in/obada-dallo-777a47a9/](https://www.linkedin.com/in/obada-dallo-777a47a9/)
- **GitHub**: [https://github.com/obadadallo95](https://github.com/obadadallo95)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
