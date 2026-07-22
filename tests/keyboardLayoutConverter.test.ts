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
  
  it('handles multi-char tokens like ligatures (لا, لأ, لإ, لآ)', () => {
    expect(convertKeyboardLayout('b', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لا');
    expect(convertKeyboardLayout('G', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لأ');
    expect(convertKeyboardLayout('T', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لإ');
    expect(convertKeyboardLayout('B', { mode: 'en2ar', platform: 'windows' }).fixedText).toBe('لآ');

    expect(convertKeyboardLayout('لا', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('b');
    expect(convertKeyboardLayout('لأ', { mode: 'ar2en', platform: 'windows' }).fixedText).toBe('G');
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

