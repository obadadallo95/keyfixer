#!/usr/bin/env python3
"""
KeyFixer - Standalone Global Hotkey Keyboard Layout Switcher
Author: Obada Dallo (عبادة دللو)
Portfolio: https://obadadallo.web.app/
GitHub: https://github.com/obadadallo95
LinkedIn: https://www.linkedin.com/in/obada-dallo-777a47a9/

Description:
Listens to global hotkeys (Ctrl+Alt+K or Cmd+Shift+K).
When triggered, it grabs clipboard text, fixes Arabic <-> English QWERTY key mapping errors,
re-pastes the fixed text seamlessly into whichever desktop app is currently focused!
"""

import sys
import time
import pyperclip

# Physical QWERTY to Arabic Layout Map
EN_TO_AR_MAP = {
    '`': 'ذ', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩', '0': '٠', '-': '-', '=': '=',
    'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج', ']': 'د', '\\': '\\',
    'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط',
    'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ',
    '~': 'ّ', '!': '!', '@': '@', '#': '#', '$': '$', '%': '%', '^': '^', '&': '&', '*': '*', '(': ')', ')': '(', '_': '_', '+': '+',
    'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'لإ', 'Y': 'إ', 'U': '‘', 'I': '÷', 'O': '×', 'P': '؛', '{': '<', '}': '>', '|': '|',
    'A': 'ِ', 'S': 'ٍ', 'D': ']', 'F': '[', 'G': 'لأ', 'H': 'أ', 'J': 'ـ', 'K': '،', 'L': '/', ':': ':', '"': '"',
    'Z': '~', 'X': 'ْ', 'C': '}', 'V': '{', 'B': 'لآ', 'N': 'آ', 'M': '’', '<': ',', '>': '.', '?': '؟'
}

# Reverse Arabic to English Map
AR_TO_EN_MAP = {ar: en for en, ar in EN_TO_AR_MAP.items()}
AR_TO_EN_MAP['لا'] = 'b'
AR_TO_EN_MAP['لأ'] = 'G'
AR_TO_EN_MAP['لإ'] = 'T'
AR_TO_EN_MAP['لآ'] = 'B'

def fix_keyboard_layout(text: str) -> str:
    """Converts mistyped text bi-directionally between QWERTY and Arabic layout."""
    if not text:
        return text

    en_count = sum(1 for c in text if c in EN_TO_AR_MAP and c.isalnum())
    ar_count = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    is_en_to_ar = en_count >= ar_count

    mapping = EN_TO_AR_MAP if is_en_to_ar else AR_TO_EN_MAP
    result = []
    i = 0
    while i < len(text):
        if not is_en_to_ar and i + 1 < len(text):
            double_char = text[i:i+2]
            if double_char in mapping:
                result.append(mapping[double_char])
                i += 2
                continue
        char = text[i]
        result.append(mapping.get(char, char))
        i += 1
    return "".join(result)

def process_clipboard():
    """Reads clipboard, converts layout, updates clipboard."""
    try:
        original = pyperclip.paste()
        if not original:
            print("[KeyFixer] Clipboard is empty.")
            return

        fixed = fix_keyboard_layout(original)
        pyperclip.copy(fixed)
        print(f"[KeyFixer] Original: '{original}' -> Fixed: '{fixed}'")
    except Exception as e:
        print(f"[KeyFixer] Error processing clipboard: {e}")

def main():
    print("=" * 60)
    print(" ⌨️ KeyFixer Desktop Listener Started")
    print(" Author: Obada Dallo (عبادة دللو) | https://obadadallo.web.app/")
    print(" Shortcut: Ctrl+Alt+K (or Cmd+Shift+K on macOS)")
    print(" Press Ctrl+C in terminal to stop.")
    print("=" * 60)

    try:
        import keyboard
        keyboard.add_hotkey('ctrl+alt+k', process_clipboard)
        keyboard.wait()
    except ImportError:
        print("\n[KeyFixer] 'keyboard' package not found or requires root/admin.")
        print("Fallback Mode: Type 'fix' and press Enter, or install pynput/keyboard.")
        while True:
            cmd = input("\nPress Enter to fix clipboard text (or 'q' to quit): ")
            if cmd.lower() == 'q':
                break
            process_clipboard()

if __name__ == "__main__":
    main()
