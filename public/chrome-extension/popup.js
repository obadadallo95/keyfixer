const EN_TO_AR_MAP = {
  '`':'ذ','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩','0':'٠','-':'-','=':'=',
  'q':'ض','w':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','[':'ج',']':'د','\\':'\\',
  'a':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م',';':'ك','\'':'ط',
  'z':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى','m':'ة',',':'و','.':'ز','/':'ظ',
  '~':'ّ','!':'!','@':'@','#':'#','$':'%','%':'%','^':'^','&':'&','*':'*','(':')',')':'(','_':'_','+':'+',
  'Q':'َ','W':'ً','E':'ُ','R':'ٌ','T':'لإ','Y':'إ','U':'‘','I':'÷','O':'×','P':'؛','{':'<','}':'>','|':'|',
  'A':'ِ','S':'ٍ','D':']','F':'[','G':'لأ','H':'أ','J':'ـ','K':'،','L':'/',':':':','"':'"',
  'Z':'~','X':'ْ','C':'}','V':'{','B':'لآ','N':'آ','M':'’','<':',','>':'.','?':'؟'
};

const AR_TO_EN_MAP = {};
for (const [enKey, arKey] of Object.entries(EN_TO_AR_MAP)) {
  if (!AR_TO_EN_MAP[arKey]) AR_TO_EN_MAP[arKey] = enKey;
}
AR_TO_EN_MAP['لا'] = 'b';
AR_TO_EN_MAP['لأ'] = 'G';
AR_TO_EN_MAP['لإ'] = 'T';
AR_TO_EN_MAP['لآ'] = 'B';

function fixLayout(text) {
  if (!text) return '';
  let enCount = 0, arCount = 0;
  for (const char of text) {
    if (EN_TO_AR_MAP[char] && /[a-zA-Z;':,.\/\[\]\\`~]/.test(char)) enCount++;
    else if (/[\u0600-\u06FF]/.test(char)) arCount++;
  }
  const isEnToAr = enCount >= arCount;
  const map = isEnToAr ? EN_TO_AR_MAP : AR_TO_EN_MAP;

  let result = '';
  let i = 0;
  while (i < text.length) {
    if (!isEnToAr) {
      const doubleChar = text.substring(i, i + 2);
      if (map[doubleChar]) {
        result += map[doubleChar];
        i += 2;
        continue;
      }
    }
    const char = text[i];
    result += map[char] !== undefined ? map[char] : char;
    i++;
  }
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
  const inputElem = document.getElementById('inputText');
  const outputElem = document.getElementById('outputText');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');

  inputElem.addEventListener('input', () => {
    outputElem.value = fixLayout(inputElem.value);
  });

  copyBtn.addEventListener('click', () => {
    if (outputElem.value) {
      navigator.clipboard.writeText(outputElem.value);
      copyBtn.innerText = 'Copied!';
      setTimeout(() => (copyBtn.innerText = 'Copy Fixed'), 1500);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputElem.value = '';
    outputElem.value = '';
  });
});
