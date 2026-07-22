/**
 * @file keymap.ts
 * @description Bi-directional Physical QWERTY <-> Arabic Keyboard Layout Mappings for Windows and Mac.
 * Part of Clean Architecture: /core/domain/entities
 */

import { KeyboardPlatform } from '../../../types';

export interface KeyMapEntry {
  en: string;
  ar: string;
  enShift?: string;
  arShift?: string;
}

// Windows Arabic 101/102 Physical Keyboard Layout Map
export const WIN_EN_TO_AR_MAP: Record<string, string> = {
  // Lowercase / Unshifted QWERTY row 1
  '`': 'ذ',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
  '0': '٠',
  '-': '-',
  '=': '=',

  // QWERTY Top Row
  'q': 'ض',
  'w': 'ص',
  'e': 'ث',
  'r': 'ق',
  't': 'ف',
  'y': 'غ',
  'u': 'ع',
  'i': 'ه',
  'o': 'خ',
  'p': 'ح',
  '[': 'ج',
  ']': 'د',
  '\\': '\\',

  // QWERTY Home Row
  'a': 'ش',
  's': 'س',
  'd': 'ي',
  'f': 'ب',
  'g': 'ل',
  'h': 'ا',
  'j': 'ت',
  'k': 'ن',
  'l': 'م',
  ';': 'ك',
  "'": 'ط',

  // QWERTY Bottom Row
  'z': 'ئ',
  'x': 'ء',
  'c': 'ؤ',
  'v': 'ر',
  'b': 'لا',
  'n': 'ى',
  'm': 'ة',
  ',': 'و',
  '.': 'ز',
  '/': 'ظ',

  // Shifted QWERTY Keys
  '~': 'ّ', // Shadda
  '!': '!',
  '@': '@',
  '#': '#',
  '$': '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '(': ')',
  ')': '(',
  '_': '_',
  '+': '+',

  // Shifted Letters
  'Q': 'َ',
  'W': 'ً',
  'E': 'ُ',
  'R': 'ٌ',
  'T': 'لإ',
  'Y': 'إ',
  'U': '‘',
  'I': '÷',
  'O': '×',
  'P': '؛',
  '{': '<',
  '}': '>',
  '|': '|',

  'A': 'ِ',
  'S': 'ٍ',
  'D': ']',
  'F': '[',
  'G': 'لأ',
  'H': 'أ',
  'J': 'ـ',
  'K': '،',
  'L': '/',
  ':': ':',
  '"': '"',

  'Z': '~',
  'X': 'ْ',
  'C': '}',
  'V': '{',
  'B': 'لآ',
  'N': 'آ',
  'M': '’',
  '<': ',',
  '>': '.',
  '?': '؟'
};

// Mac Arabic (Standard Apple Layout) Physical Keyboard Layout Map
export const MAC_EN_TO_AR_MAP: Record<string, string> = {
  ...WIN_EN_TO_AR_MAP,
  // Key differences on Mac Arabic Standard layout:
  '`': '§',
  '[': 'ج',
  ']': 'ة',
  '\'': '؛',
  '\\': '\\',
  'z': 'ظ',
  'x': 'ط',
  'c': 'ذ',
  'v': 'د',
  'b': 'ز',
  'n': 'ر',
  'm': 'و',
  ',': '،',
  '.': '.',
  '/': '/',
  // Shifted variations differences
  '~': '±',
  'Z': 'ظ',
  'X': 'ط',
  'C': 'ئ',
  'V': 'ء',
  'B': 'أ',
  'N': 'إ',
  'M': 'ؤ',
  '<': '>',
  '>': '<',
  '?': '؟'
};

// Default export fallback for compatibility
export const EN_TO_AR_MAP = WIN_EN_TO_AR_MAP;

function createReverseMap(enMap: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [enKey, arKey] of Object.entries(enMap)) {
    if (!map[arKey]) {
      map[arKey] = enKey;
    }
  }
  map['لا'] = 'b';
  map['لأ'] = 'G';
  map['لإ'] = 'T';
  map['لآ'] = 'B';
  return map;
}

export const WIN_AR_TO_EN_MAP = createReverseMap(WIN_EN_TO_AR_MAP);
export const MAC_AR_TO_EN_MAP = createReverseMap(MAC_EN_TO_AR_MAP);

export const AR_TO_EN_MAP = WIN_AR_TO_EN_MAP;

export function getKeyMaps(platform: KeyboardPlatform = 'windows') {
  if (platform === 'mac') {
    return { en2ar: MAC_EN_TO_AR_MAP, ar2en: MAC_AR_TO_EN_MAP };
  }
  return { en2ar: WIN_EN_TO_AR_MAP, ar2en: WIN_AR_TO_EN_MAP };
}

/**
 * Detects whether a text is likely English QWERTY typed while intending Arabic,
 * or Arabic typed while intending English QWERTY.
 */
export function detectMistypedMode(text: string, platform: KeyboardPlatform = 'windows'): 'en2ar' | 'ar2en' {
  if (!text || text.trim().length === 0) return 'en2ar';

  const { en2ar } = getKeyMaps(platform);
  let enCount = 0;
  let arCount = 0;

  for (const char of text) {
    if (en2ar[char] && /[a-zA-Z;':,.\/\[\]\\`~]/.test(char)) {
      enCount++;
    } else if (/[\u0600-\u06FF]/.test(char)) {
      arCount++;
    }
  }

  return enCount >= arCount ? 'en2ar' : 'ar2en';
}
