import { WIN_EN_TO_AR_MAP, WIN_AR_TO_EN_MAP } from './layouts/windowsArabic101';
import { MAC_EN_TO_AR_MAP, MAC_AR_TO_EN_MAP } from './layouts/macArabic';
import { detectMistypedMode } from './detectConversionDirection';
import { KeyboardPlatform, FixLayoutOptions, FixLayoutResult, KeyMap } from './types';

export function getKeyMaps(platform: KeyboardPlatform = 'windows'): KeyMap {
  if (platform === 'mac') {
    return { en2ar: MAC_EN_TO_AR_MAP, ar2en: MAC_AR_TO_EN_MAP };
  }
  return { en2ar: WIN_EN_TO_AR_MAP, ar2en: WIN_AR_TO_EN_MAP };
}

function isArabicBaseLetter(char: string): boolean {
  // Matches true Arabic alphabet letters & ligatures, excluding diacritics (Tashkeel) and punctuation
  return /^[\u0621-\u063A\u0641-\u064A\u0671-\u06D3\u067E\u0686\u0698\u06AF]|^(لا|لأ|لإ|لآ)$/.test(char);
}

export function convertKeyboardLayout(text: string, options: FixLayoutOptions = {}): FixLayoutResult {
  const { mode = 'auto', platform = 'windows' } = options;

  if (!text) {
    return {
      originalText: '',
      fixedText: '',
      appliedMode: 'en2ar',
      platform,
      charCount: 0,
      wordCount: 0,
      changedCharCount: 0,
    };
  }

  const { en2ar, ar2en } = getKeyMaps(platform);
  const appliedMode = mode === 'auto' ? detectMistypedMode(text, platform) : mode;
  const mapping = appliedMode === 'en2ar' ? en2ar : ar2en;

  let fixedText = '';
  let changedCharCount = 0;

  if (appliedMode === 'en2ar') {
    let i = 0;
    while (i < text.length) {
      const char = text[i];

      if (/[A-Z]/.test(char)) {
        const directMap = mapping[char];
        if (text.length === 1 && directMap !== undefined) {
          fixedText += directMap;
          if (directMap !== char) changedCharCount++;
        } else if (directMap && isArabicBaseLetter(directMap)) {
          // If direct map produces an Arabic base letter (e.g. H -> أ, Y -> إ, N -> آ, G -> لأ, T -> لإ, B -> لأ/أ), use it
          fixedText += directMap;
          changedCharCount++;
        } else {
          // If direct map is a diacritic / symbol (e.g. O -> ×, I -> ÷, D -> ], S -> ٍ, E -> ُ, A -> ِ),
          // fallback to the base Arabic letter on that key to preserve word semantics and avoid corruption
          const lowerChar = char.toLowerCase();
          const baseMap = mapping[lowerChar];
          if (baseMap !== undefined) {
            fixedText += baseMap;
            changedCharCount++;
          } else {
            fixedText += char;
          }
        }
      } else if (mapping[char] !== undefined) {
        fixedText += mapping[char];
        if (mapping[char] !== char) {
          changedCharCount++;
        }
      } else {
        fixedText += char;
      }
      i++;
    }
  } else {
    // ar2en mode (Arabic to English)
    let i = 0;
    while (i < text.length) {
      const doubleChar = text.substring(i, i + 2);
      if (mapping[doubleChar]) {
        fixedText += mapping[doubleChar];
        changedCharCount += 2;
        i += 2;
        continue;
      }

      const char = text[i];
      if ((char === ']' || char === '[') && i + 1 < text.length && /[a-zA-Z]/.test(text[i + 1])) {
        // Convert ]bada -> Obada and [smail -> Ismail when ] or [ is placed before English letters
        const targetEn = char === ']' ? 'O' : 'I';
        fixedText += targetEn;
        changedCharCount++;
      } else if (char === 'أ') {
        const prevChar = i > 0 ? text[i - 1] : '';
        const isPrecededByO = prevChar === ']' || prevChar === '×' || fixedText.endsWith('O');
        const mappedEn = isPrecededByO ? 'B' : (mapping['أ'] || 'H');
        fixedText += mappedEn;
        changedCharCount++;
      } else if (mapping[char] !== undefined) {
        fixedText += mapping[char];
        if (mapping[char] !== char) {
          changedCharCount++;
        }
      } else {
        fixedText += char;
      }
      i++;
    }

    // Post-process ALL-CAPS words in ar2en mode (e.g. OBAdA -> OBADA)
    fixedText = fixedText.replace(/\b([A-Z]{2,}[a-z][A-Z]*|[A-Z]+[a-z][A-Z]{2,})\b/g, (match) => match.toUpperCase());
  }



  const words = text.trim().split(/\s+/).filter(Boolean);

  return {
    originalText: text,
    fixedText,
    appliedMode,
    platform,
    charCount: text.length,
    wordCount: words.length,
    changedCharCount,
  };
}
