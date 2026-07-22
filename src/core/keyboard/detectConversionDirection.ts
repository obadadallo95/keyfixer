import { WIN_EN_TO_AR_MAP } from './layouts/windowsArabic101';
import { MAC_EN_TO_AR_MAP } from './layouts/macArabic';
import { KeyboardPlatform } from './types';

export function detectMistypedMode(text: string, platform: KeyboardPlatform = 'windows'): 'en2ar' | 'ar2en' {
  if (!text || text.trim().length === 0) return 'en2ar';
  const en2ar = platform === 'mac' ? MAC_EN_TO_AR_MAP : WIN_EN_TO_AR_MAP;
  
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
