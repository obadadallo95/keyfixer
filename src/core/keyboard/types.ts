export type KeyboardPlatform = 'windows' | 'mac';
export type ConversionMode = 'auto' | 'en2ar' | 'ar2en';

export interface KeyMap {
  en2ar: Record<string, string>;
  ar2en: Record<string, string>;
}

export interface FixLayoutOptions {
  mode?: ConversionMode;
  platform?: KeyboardPlatform;
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
