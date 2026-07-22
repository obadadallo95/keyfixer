/**
 * @file FixKeyboardLayoutUseCase.ts
 * @description Pure physical QWERTY <-> Arabic key mapping use-case (Offline & Zero-latency).
 * Part of Clean Architecture: /core/use-cases
 */

import { getKeyMaps, detectMistypedMode } from '../domain/entities/keymap';
import { KeyboardPlatform } from '../../types';

export interface FixLayoutOptions {
  mode?: 'auto' | 'en2ar' | 'ar2en';
  platform?: KeyboardPlatform;
  preserveFormatting?: boolean;
}

export interface FixLayoutResult {
  originalText: string;
  fixedText: string;
  appliedMode: 'en2ar' | 'ar2en';
  platform: KeyboardPlatform;
  charCount: number;
  wordCount: number;
  changedCharCount: number;
}

export class FixKeyboardLayoutUseCase {
  /**
   * Executes physical keyboard layout conversion.
   */
  public execute(text: string, options: FixLayoutOptions = {}): FixLayoutResult {
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

    // Process multi-character tokens like 'لا' or 'لأ' if in ar2en mode first
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
}

// Export singleton instance for simple usage
export const fixKeyboardLayoutUseCase = new FixKeyboardLayoutUseCase();
