import { describe, it, expect } from 'vitest';
import { convertKeyboardLayout } from '../src/core/keyboard/keyboardLayoutConverter';

describe('Keyboard Layout Converter', () => {
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

  it('preserves unsupported characters like Emoji', () => {
    const result = convertKeyboardLayout('اثممخ 👋', { mode: 'ar2en', platform: 'windows' });
    expect(result.fixedText).toBe('hello 👋');
  });

  it('handles Mac differences (e.g., z = ظ)', () => {
    const result = convertKeyboardLayout('z', { mode: 'en2ar', platform: 'mac' });
    expect(result.fixedText).toBe('ظ'); // Mac specific
  });
  
  it('handles multi-char tokens like لا', () => {
    const result = convertKeyboardLayout('b', { mode: 'en2ar', platform: 'windows' });
    expect(result.fixedText).toBe('لا');
    
    const reverseResult = convertKeyboardLayout('لا', { mode: 'ar2en', platform: 'windows' });
    expect(reverseResult.fixedText).toBe('b');
  });
});
