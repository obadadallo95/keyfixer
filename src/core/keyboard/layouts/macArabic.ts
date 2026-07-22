import { WIN_EN_TO_AR_MAP } from './windowsArabic101';

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

export const MAC_EN_TO_AR_MAP: Record<string, string> = {
  ...WIN_EN_TO_AR_MAP,
  '`': '§', '[': 'ج', ']': 'ة', '\'': '؛', '\\': '\\',
  'z': 'ظ', 'x': 'ط', 'c': 'ذ', 'v': 'د', 'b': 'ز', 'n': 'ر', 'm': 'و', ',': '،', '.': '.', '/': '/',
  '~': '±', 'Z': 'ظ', 'X': 'ط', 'C': 'ئ', 'V': 'ء', 'B': 'أ', 'N': 'إ', 'M': 'ؤ', '<': '>', '>': '<', '?': '؟'
};

export const MAC_AR_TO_EN_MAP = createReverseMap(MAC_EN_TO_AR_MAP);
