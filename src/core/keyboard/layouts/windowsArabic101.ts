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
  // Explicit reverse mappings for Windows Arabic 101 layout
  map['د'] = ']';
  map['ج'] = '[';
  map['ك'] = ';';
  map['ط'] = "'";
  map['أ'] = 'H';
  map['إ'] = 'Y';
  map['آ'] = 'N';
  map['ؤ'] = 'c';
  map['ئ'] = 'z';
  map['ء'] = 'x';
  map['لا'] = 'b';
  map['لأ'] = 'G';
  map['لإ'] = 'T';
  map['لآ'] = 'B';
  map['×'] = 'O';
  map['÷'] = 'I';
  map['؛'] = 'P';
  map['،'] = 'K';
  map['ـ'] = 'J';
  map['؟'] = '?';
  map[']'] = ']';
  map['['] = '[';
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

export const WIN_EN_TO_AR_MAP: Record<string, string> = {
  '`': 'ذ', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩', '0': '٠', '-': '-', '=': '=',
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج', ']': 'د', '\\': '\\',
  'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط',
  'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ',
  
  '~': 'ّ', '!': '!', '@': '@', '#': '#', '$': '$', '%': '%', '^': '^', '&': '&', '*': '*', '(': ')', ')': '(', '_': '_', '+': '+',
  'Q': 'َ', 'W': 'ً', 'E': 'ُ', 'R': 'ٌ', 'T': 'لإ', 'Y': 'إ', 'U': '‘', 'I': '÷', 'O': '×', 'P': '؛', '{': '<', '}': '>', '|': '|',
  'A': 'ِ', 'S': 'ٍ', 'D': ']', 'F': '[', 'G': 'لأ', 'H': 'أ', 'J': 'ـ', 'K': '،', 'L': '/', ':': ':', '"': '"',
  'Z': '~', 'X': 'ْ', 'C': '}', 'V': '{', 'B': 'لآ', 'N': 'آ', 'M': '’', '<': ',', '>': '.', '?': '؟'
};

export const WIN_AR_TO_EN_MAP = createReverseMap(WIN_EN_TO_AR_MAP);

