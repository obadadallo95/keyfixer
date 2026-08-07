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
});

