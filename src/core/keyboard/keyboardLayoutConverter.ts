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

  let i = 0;
  while (i < text.length) {
    if (appliedMode === 'ar2en') {
      const doubleChar = text.substring(i, i + 2);
      if (mapping[doubleChar]) {
        fixedText += mapping[doubleChar];
        changedCharCount += 2;
        i += 2;
        continue;
      }
    }
    
    const char = text[i];
    if (mapping[char] !== undefined) {
      fixedText += mapping[char];
      if (mapping[char] !== char) {
        changedCharCount++;
      }
    } else {
      fixedText += char;
    }
    i++;
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
