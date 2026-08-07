import { WIN_EN_TO_AR_MAP } from './windowsArabic101';

function createReverseMap(enMap: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [enKey, arKey] of Object.entries(enMap)) {
    if (!map[arKey]) {
      // Do not map punctuation symbols to uppercase letters in reverse map (e.g. ] -> D)
      if (/[A-Z]/.test(enKey) && /[\[\]\{\}\/~`!@#$%^&*()_+=|\\:;"'<>,.?]/.test(arKey)) {
        continue;
      }
      map[arKey] = enKey;
    }
  }
  // Mac specific explicit reverse mappings
  map['د'] = 'v';
  map['ة'] = ']';
  map['ج'] = '[';
  map['ظ'] = 'z';
  map['ط'] = 'x';
  map['ذ'] = 'c';
  map['ز'] = 'b';
  map['ر'] = 'n';
  map['و'] = 'm';
  map['،'] = ',';
  map['؛'] = "'";
  map['أ'] = 'H';
  map['إ'] = 'Y';
  map['ؤ'] = 'M';
  map['ئ'] = 'C';
  map['ء'] = 'V';
  map['لا'] = 'gh';
  map['لأ'] = 'G';
  map['لإ'] = 'T';
  map['×'] = 'O';
  map['÷'] = 'I';
  map[']'] = 'O';  // Mac Arabic Shift+O produces ] which maps to capital O
  map['['] = 'P';  // Mac Arabic Shift+P produces [ which maps to capital P
  map['ـ'] = 'J';  // Tatweel maps to J
  map['؟'] = '?';  // Arabic question mark maps to ?
  map['}'] = '}';
  map['{'] = '{';
  map['/'] = '/';
  map['~'] = '~';

  // Tashkeel Vowels (Shifted QWERTY keys when typing ALL-CAPS in English on Arabic layout)
  map['َ'] = 'Q';  // Fatha -> Q
  map['ً'] = 'W';  // Tanwin Fath -> W
  map['ُ'] = 'E';  // Damma -> E
  map['ٌ'] = 'R';  // Tanwin Damm -> R
  map['ِ'] = 'A';  // Kasra -> A
  map['ٍ'] = 'S';  // Tanwin Kasr -> S
  map['ْ'] = 'X';  // Sukun -> X
  map['ّ'] = '~';  // Shadda -> ~

  return map;
}

export const MAC_EN_TO_AR_MAP: Record<string, string> = {
  ...WIN_EN_TO_AR_MAP,
  '`': '§', '[': 'ج', ']': 'ة', '\'': '؛', '\\': '\\',
  'z': 'ظ', 'x': 'ط', 'c': 'ذ', 'v': 'د', 'b': 'ز', 'n': 'ر', 'm': 'و', ',': '،', '.': '.', '/': '/',
  '~': '±', 'Z': 'ظ', 'X': 'ط', 'C': 'ئ', 'V': 'ء', 'B': 'أ', 'N': 'إ', 'M': 'ؤ', '<': '>', '>': '<', '?': '؟'
};

export const MAC_AR_TO_EN_MAP = createReverseMap(MAC_EN_TO_AR_MAP);

