import { describe, it, expect } from 'vitest';
import { convertKeyboardLayout, getKeyMaps } from '../src/core/keyboard/keyboardLayoutConverter';
import { WIN_EN_TO_AR_MAP } from '../src/core/keyboard/layouts/windowsArabic101';
import { MAC_EN_TO_AR_MAP } from '../src/core/keyboard/layouts/macArabic';

describe('Keyboard Layout Converter - Engine Core', () => {
  it('converts English to Arabic accurately (Windows)', () => {
    const result = convertKeyboardLayout('hgpl] ggi', { mode: 'en2ar', platform: 'windows' });
    expect(result.fixedText).toBe('الحمد لله');
  });

  it('converts Arabic to English accurately (Windows)', () => {
    const result = convertKeyboardLayout('اثممخ', { mode: 'ar2en', platform: 'windows' });
    expect(result.fixedText).toBe('hello');
  });

  it('handles Auto Detect English -> Arabic', () => {
    const result = convertKeyboardLayout('hgpl] ggi', { mode: 'auto', platform: 'windows' });
    expect(result.fixedText).toBe('الحمد لله');
    expect(result.appliedMode).toBe('en2ar');
  });

  it('handles Auto Detect Arabic -> English', () => {
    const result = convertKeyboardLayout('اثممخ', { mode: 'auto', platform: 'windows' });
    expect(result.fixedText).toBe('hello');
    expect(result.appliedMode).toBe('ar2en');
  });

  it('handles Auto Detect for numbers defaulting to en2ar (Arabic-Indic digits)', () => {
    // 123 -> enCount=0, arCount=0. 0 >= 0 is true, so en2ar.
    const result = convertKeyboardLayout('123', { mode: 'auto', platform: 'windows' });
    expect(result.appliedMode).toBe('en2ar');
    expect(result.fixedText).toBe('١٢٣'); // Western digits map to Arabic-Indic digits in en2ar
  });

  it('respects explicit ar2en mode for numbers', () => {
    // If the user explicitly wants to convert Arabic-Indic digits to Western digits
    const result = convertKeyboardLayout('١٢٣', { mode: 'ar2en', platform: 'windows' });
    expect(result.appliedMode).toBe('ar2en');
    expect(result.fixedText).toBe('123');
  });

  it('preserves spaces and line breaks', () => {
    const result = convertKeyboardLayout('hggi h;fv\n\n[hlum', { mode: 'en2ar', platform: 'windows' });
    expect(result.fixedText).toBe('الله اكبر\n\nجامعة');
  });

  it('preserves unsupported characters like Emojis', () => {
    const result = convertKeyboardLayout('اثممخ 👋 🚀', { mode: 'ar2en', platform: 'windows' });
    expect(result.fixedText).toBe('hello 👋 🚀');
  });

  it('handles Mac specific layout mappings', () => {
    const result = convertKeyboardLayout('z', { mode: 'en2ar', platform: 'mac' });
    expect(result.fixedText).toBe('ظ');
  });
  
  it('handles Windows uniquely reversible ligature mappings', () => {
    expect(convertKeyboardLayout('b', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لا');
    expect(convertKeyboardLayout('G', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لأ');
    expect(convertKeyboardLayout('T', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لإ');
    expect(convertKeyboardLayout('B', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لآ');

    expect(convertKeyboardLayout('لا', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('b');
    expect(convertKeyboardLayout('لأ', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('G');
    expect(convertKeyboardLayout('لإ', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('T');
    expect(convertKeyboardLayout('لآ', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('B');
  });

  it('handles Mac uniquely reversible ligature mappings', () => {
    // Mac 'b' maps to 'ز', NOT 'لا'
    expect(convertKeyboardLayout('b', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('ز');
    expect(convertKeyboardLayout('ز', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('b');

    // Mac 'لا' is typed via 'g' (ل) + 'h' (ا) and naturally reverses to 'gh'
    expect(convertKeyboardLayout('gh', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('لا');
    expect(convertKeyboardLayout('لا', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('gh');
  });

  it('documents Mac intentionally asymmetrical ligature mappings', () => {
    // 'G' maps to 'لأ'. 'gH' maps to 'لأ'. When reversing 'لأ', it uses the first map which is 'G'.
    expect(convertKeyboardLayout('G', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('لأ');
    expect(convertKeyboardLayout('gH', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('لأ');
    expect(convertKeyboardLayout('لأ', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('G');

    // 'T' maps to 'لإ'. 'gY' maps to 'لإ'. Reversing 'لإ' yields 'T'.
    expect(convertKeyboardLayout('T', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('لإ');
    expect(convertKeyboardLayout('gY', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('لإ');
    expect(convertKeyboardLayout('لإ', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('T');
  });

  it('documents Mac intentionally non-reversible mappings', () => {
    // Mac 'لآ' is composed of 'ل' (g) and 'آ'. 
    // However, the Mac layout overrides 'N' to 'إ', leaving 'آ' without a single-key English mapping.
    // Thus, 'آ' remains 'آ' when converting ar2en on Mac.
    expect(convertKeyboardLayout('لآ', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('gآ');
  });

  it('handles empty input gracefully', () => {
    const result = convertKeyboardLayout('', { mode: 'auto', platform: 'windows' });
    expect(result.fixedText).toBe('');
    expect(result.charCount).toBe(0);
    expect(result.wordCount).toBe(0);
  });

  it('validates every single key in Windows EN->AR layout map', () => {
    for (const [enKey, arChar] of Object.entries(WIN_EN_TO_AR_MAP)) {
      const result = convertKeyboardLayout(enKey, { mode: 'en2ar', platform: 'windows' });
      expect(result.fixedText).toBe(arChar);
    }
  });

  it('validates every single key in Mac EN->AR layout map', () => {
    for (const [enKey, arChar] of Object.entries(MAC_EN_TO_AR_MAP)) {
      const result = convertKeyboardLayout(enKey, { mode: 'en2ar', platform: 'mac' });
      expect(result.fixedText).toBe(arChar);
    }
  });

  it('supports round-trip conversion for single character keys', () => {
    const original = 'hgpl]';
    const converted = convertKeyboardLayout(original, { mode: 'en2ar', platform: 'windows' }).fixedText;
    const restored = convertKeyboardLayout(converted, { mode: 'ar2en', platform: 'windows' }).fixedText;
    expect(restored).toBe(original);
  });

  describe('Uppercase & Shift Semantics Preservation', () => {
    it('preserves uppercase when converting Arabic text with uppercase mappings to English', () => {
      const result = convertKeyboardLayout('أشممخ ÷ شة ×لاشيش', { mode: 'ar2en', platform: 'windows' });
      expect(result.fixedText).toBe('Hallo I am Obada');
    });

    it('correctly handles English words with uppercase letters in en2ar without symbol corruption', () => {
      // Obada (starts with O) should convert to Arabic letters, not multiplication symbol '×'
      const result = convertKeyboardLayout('Obada', { mode: 'en2ar', platform: 'windows' });
      expect(result.fixedText).toBe('خلاشيش');
    });

    it('preserves lowercase text in standard Arabic to English conversion', () => {
      const input = 'اثممخ ه شة خلاشيش';
      const result = convertKeyboardLayout(input, { mode: 'ar2en', platform: 'windows' });
      expect(result.fixedText).toBe('hello i am obada');
    });

    it('handles mixed-case English input gracefully without symbol corruption', () => {
      const result = convertKeyboardLayout('Hallo I am Obada', { mode: 'en2ar', platform: 'windows' });
      expect(result.fixedText).toBe('أشممخ ه شة خلاشيش');
    });

    it('handles all-uppercase English words without math symbol corruption', () => {
      const result = convertKeyboardLayout('HELLO', { mode: 'en2ar', platform: 'windows' });
      expect(result.fixedText).toBe('أثممخ');
    });

    it('converts common English names properly without symbol corruption', () => {
      expect(convertKeyboardLayout('Sara', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('سشقش');
      expect(convertKeyboardLayout('Karim', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('نشقهة');
      expect(convertKeyboardLayout('David', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('يشرهي');
      expect(convertKeyboardLayout('Obada', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('خلاشيش');
      expect(convertKeyboardLayout('Obada', { mode: 'en2ar', platform: 'mac' }).fixedText).toBe('خزشيش');
    });

    it('preserves capital letters in English names when converted back', () => {
      expect(convertKeyboardLayout('×لاشيش', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('Obada');
      expect(convertKeyboardLayout('×زشيش', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('Obada');
      expect(convertKeyboardLayout('خزشيش', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('obada');
      expect(convertKeyboardLayout('أشممخ', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('Hallo');
      expect(convertKeyboardLayout('÷', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('I');
      expect(convertKeyboardLayout('÷', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('I');
    });

    it('correctly converts Mac Arabic bracket text (اه ه شو ]زشيش -> hi i am Obada)', () => {
      const enResult = convertKeyboardLayout('اه ه شو ]زشيش', { mode: 'ar2en', platform: 'mac' });
      expect(enResult.fixedText).toBe('hi i am Obada');
      expect(convertKeyboardLayout(']زشيش', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('Obada');
    });

    it('correctly converts ALL-CAPS Shifted English typed on Mac Arabic layout (أ÷ ÷ ِؤ ]أِيِ -> HI I AM OBADA)', () => {
      const result = convertKeyboardLayout('أ÷ ÷ ِؤ ]أِيِ', { mode: 'ar2en', platform: 'mac' });
      expect(result.fixedText).toBe('HI I AM OBADA');
    });
  });

  describe('Comprehensive Professional Word & Sentence Suite', () => {
    it('handles full pangram sentences bidirectionally on Mac & Windows', () => {
      const englishSentence = 'the quick brown fox jumps over the lazy dog';
      
      // Windows
      const winAr = convertKeyboardLayout(englishSentence, { mode: 'en2ar', platform: 'windows' }).fixedText;
      const winEn = convertKeyboardLayout(winAr, { mode: 'ar2en', platform: 'windows' }).fixedText;
      expect(winEn).toBe(englishSentence);

      // Mac
      const macAr = convertKeyboardLayout(englishSentence, { mode: 'en2ar', platform: 'mac' }).fixedText;
      const macEn = convertKeyboardLayout(macAr, { mode: 'ar2en', platform: 'mac' }).fixedText;
      expect(macEn).toBe(englishSentence);
    });

    it('handles mistyped Arabic sentences back to English perfectly', () => {
      // User typed "hi i am Obada" on Mac Arabic keyboard
      expect(convertKeyboardLayout('اه ه شو ]زشيش', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('hi i am Obada');
      
      // User typed "Hallo I am Obada" on Mac Arabic keyboard ("am" = "شو")
      expect(convertKeyboardLayout('أشممخ ÷ شو ]زشيش', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('Hallo I am Obada');

      // User typed "HI I AM OBADA" on Mac Arabic keyboard
      expect(convertKeyboardLayout('أ÷ ÷ ِؤ ]أِيِ', { mode: 'ar2en', platform: 'mac' }).fixedText).toBe('HI I AM OBADA');
    });

    it('handles mistyped English typed when keyboard was on Arabic (Windows)', () => {
      // User typed "hello world" on Windows Arabic 101 keyboard: "اثممخ صخقمي"
      expect(convertKeyboardLayout('اثممخ صخقمي', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('hello world');

      // User typed "Hallo I am Obada" on Windows Arabic keyboard: "أشممخ ÷ شة ×لاشيش"
      expect(convertKeyboardLayout('أشممخ ÷ شة ×لاشيش', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('Hallo I am Obada');
    });

    it('handles popular city & country names with mixed casing', () => {
      const names = ['london', 'berlin', 'cairo', 'dubai', 'amman', 'riyadh'];
      for (const name of names) {
        const arMac = convertKeyboardLayout(name, { mode: 'en2ar', platform: 'mac' }).fixedText;
        const restoredMac = convertKeyboardLayout(arMac, { mode: 'ar2en', platform: 'mac' }).fixedText;
        expect(restoredMac.toLowerCase()).toBe(name.toLowerCase());
      }
    });
  });
});




