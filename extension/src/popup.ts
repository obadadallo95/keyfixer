import { convertKeyboardLayout } from '../../src/core/keyboard';
import { KeyboardPlatform, ConversionMode } from '../../src/core/keyboard/types';

type UILanguage = 'ar' | 'en';
type ViewName = 'home' | 'privacy' | 'terms' | 'developer';

const messages = {
  en: {
    tagline: 'Fix keyboard layouts instantly', offlineBadge: 'Local & private', directionLabel: 'Conversion direction',
    keyboardLabel: 'Keyboard', modeAuto: 'Auto', modeEnAr: 'EN → AR', modeArEn: 'AR → EN', inputLabel: 'Original text',
    inputPlaceholder: 'Type or paste mistyped text…', outputLabel: 'Corrected text', outputPlaceholder: 'The corrected text appears here…',
    instantResult: 'Instant result', copyButton: 'Copy corrected text', copiedButton: 'Copied', clearButton: 'Clear',
    privacyNote: 'Text is processed locally and never leaves your device.', privacyLink: 'Privacy', termsLink: 'Terms', developerLink: 'Developer',
    privacyTitle: 'Privacy policy', privacyUpdated: 'Updated August 1, 2026', privacyCommitmentTitle: 'Your text stays yours',
    privacyCommitmentBody: 'KeyFixer processes text entirely on your device. It does not send text, browsing history, or personal information to any server.',
    privacyStorageTitle: 'What is stored', privacyStorageBody: 'Only your keyboard, conversion mode, and interface language preferences are stored locally. Typed and corrected text is never saved.',
    privacyPermissionsTitle: 'Why permissions are needed', privacyPermissionContext: 'Context menus: show KeyFixer when you right-click selected text.',
    privacyPermissionActive: 'Active tab and scripting: run only after you choose a KeyFixer command, on that page.', privacyPermissionStorage: 'Storage: remember preferences on this device.',
    privacyPermissionClipboard: 'Clipboard: copy the corrected result when requested.', privacyNoServices: 'The extension contains no analytics, advertising, accounts, or third-party network services.',
    termsTitle: 'Terms of use', termsUpdated: 'Updated August 1, 2026', termsPurposeTitle: 'Purpose',
    termsPurposeBody: 'KeyFixer is a free utility for correcting text typed with the wrong Arabic or English keyboard layout.', termsUseTitle: 'Acceptable use',
    termsUseBody: 'You may use it for personal or professional work. You may not use it for illegal activity, misrepresent it as your own product, or misuse its name or identity.',
    termsDisclaimerTitle: 'Disclaimer', termsDisclaimerBody: 'The extension is provided as is. Review corrected text before relying on it; compatibility and conversion accuracy cannot be guaranteed on every website or configuration.',
    developerTitle: 'About the developer', developerName: 'Obada Dallo',
    developerBody: 'KeyFixer is an independent, privacy-first tool designed and developed by Obada Dallo to make Arabic and English typing faster and less frustrating.',
    contactDeveloper: 'Contact the developer', externalNote: 'Opens the official contact page in a new tab.', backLabel: 'Back',
  },
  ar: {
    tagline: 'صحّح تخطيط لوحة المفاتيح فوراً', offlineBadge: 'محلي وخاص', directionLabel: 'اتجاه التحويل',
    keyboardLabel: 'لوحة المفاتيح', modeAuto: 'كشف تلقائي', modeEnAr: 'إنجليزي ← عربي', modeArEn: 'عربي ← إنجليزي', inputLabel: 'النص الأصلي',
    inputPlaceholder: 'اكتب أو الصق النص المكتوب بالتخطيط الخطأ…', outputLabel: 'النص المصحح', outputPlaceholder: 'ستظهر النتيجة المصححة هنا…',
    instantResult: 'نتيجة فورية', copyButton: 'نسخ النص المصحح', copiedButton: 'تم النسخ', clearButton: 'مسح',
    privacyNote: 'يُعالج النص محلياً ولا يغادر جهازك أبداً.', privacyLink: 'الخصوصية', termsLink: 'الشروط', developerLink: 'المطور',
    privacyTitle: 'سياسة الخصوصية', privacyUpdated: 'آخر تحديث: 1 أغسطس 2026', privacyCommitmentTitle: 'نصك يبقى لك',
    privacyCommitmentBody: 'يعالج KeyFixer النص بالكامل على جهازك. لا يرسل النصوص أو سجل التصفح أو أي معلومات شخصية إلى أي خادم.',
    privacyStorageTitle: 'ما الذي يتم حفظه', privacyStorageBody: 'تُحفظ محلياً فقط تفضيلات لوحة المفاتيح واتجاه التحويل ولغة الواجهة. لا تُحفظ النصوص المكتوبة أو المصححة.',
    privacyPermissionsTitle: 'لماذا نحتاج الصلاحيات', privacyPermissionContext: 'القائمة السياقية: لإظهار KeyFixer عند النقر بالزر الأيمن على نص محدد.',
    privacyPermissionActive: 'التبويب النشط والبرمجة النصية: للعمل على الصفحة فقط بعد اختيارك لأمر KeyFixer.', privacyPermissionStorage: 'التخزين: لتذكر تفضيلاتك على هذا الجهاز.',
    privacyPermissionClipboard: 'الحافظة: لنسخ النتيجة المصححة عندما تطلب ذلك.', privacyNoServices: 'لا تحتوي الإضافة على تحليلات أو إعلانات أو حسابات أو خدمات شبكة من أطراف خارجية.',
    termsTitle: 'شروط الاستخدام', termsUpdated: 'آخر تحديث: 1 أغسطس 2026', termsPurposeTitle: 'الغرض',
    termsPurposeBody: 'KeyFixer أداة مجانية لتصحيح النص المكتوب بتخطيط لوحة مفاتيح عربية أو إنجليزية غير صحيح.', termsUseTitle: 'الاستخدام المقبول',
    termsUseBody: 'يمكنك استخدامها لأعمالك الشخصية أو المهنية. لا يجوز استخدامها في نشاط غير قانوني، أو تقديمها كمنتجك الخاص، أو إساءة استخدام اسمها أو هويتها.',
    termsDisclaimerTitle: 'إخلاء المسؤولية', termsDisclaimerBody: 'تُقدَّم الإضافة كما هي. راجع النص المصحح قبل الاعتماد عليه؛ لا يمكن ضمان التوافق ودقة التحويل على كل موقع أو إعداد.',
    developerTitle: 'عن المطور', developerName: 'عبادة دللو',
    developerBody: 'KeyFixer أداة مستقلة تراعي الخصوصية، صممها وطورها عبادة دللو لجعل الكتابة بالعربية والإنجليزية أسرع وأقل إزعاجاً.',
    contactDeveloper: 'تواصل مع المطور', externalNote: 'يفتح صفحة التواصل الرسمية في تبويب جديد.', backLabel: 'رجوع',
  },
} as const;

document.addEventListener('DOMContentLoaded', async () => {
  const inputArea = document.getElementById('input-area') as HTMLTextAreaElement;
  const outputArea = document.getElementById('output-area') as HTMLTextAreaElement;
  const platformSelect = document.getElementById('platform-select') as HTMLSelectElement;
  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const languageBtn = document.getElementById('language-btn') as HTMLButtonElement;
  const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
  const characterCount = document.getElementById('character-count') as HTMLSpanElement;
  const version = document.getElementById('extension-version') as HTMLSpanElement;
  const caption = document.getElementById('view-caption') as HTMLDivElement;
  const segments = [...document.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const viewLinks = [...document.querySelectorAll<HTMLButtonElement>('[data-view]')];

  const prefs = await chrome.storage.local.get(['platform', 'mode', 'uiLanguage']);
  let mode: ConversionMode = isMode(prefs.mode) ? prefs.mode : 'auto';
  let currentView: ViewName = 'home';
  let language: UILanguage = isLanguage(prefs.uiLanguage)
    ? prefs.uiLanguage
    : chrome.i18n.getUILanguage().toLowerCase().startsWith('ar') ? 'ar' : 'en';

  if (prefs.platform === 'mac' || prefs.platform === 'windows') platformSelect.value = prefs.platform;
  version.textContent = `v${chrome.runtime.getManifest().version}`;

  function translate() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    languageBtn.textContent = language === 'ar' ? 'EN' : 'عربي';
    languageBtn.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    backBtn.setAttribute('aria-label', messages[language].backLabel);

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n as keyof typeof messages.en;
      element.textContent = messages[language][key];
    });
    document.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder as keyof typeof messages.en;
      element.setAttribute('placeholder', messages[language][key]);
    });
    updateCaption();
  }

  function updateCaption() {
    const captionKeys: Record<ViewName, keyof typeof messages.en> = {
      home: 'tagline', privacy: 'privacyTitle', terms: 'termsTitle', developer: 'developerTitle',
    };
    caption.textContent = messages[language][captionKeys[currentView]];
  }

  function showView(view: ViewName) {
    currentView = view;
    document.querySelectorAll<HTMLElement>('.view').forEach((element) => {
      const isTarget = element.id === `${view}-view`;
      element.hidden = !isTarget;
      element.classList.toggle('active-view', isTarget);
    });
    backBtn.hidden = view === 'home';
    updateCaption();
  }

  function updateModeButtons() {
    segments.forEach((segment) => {
      const active = segment.dataset.mode === mode;
      segment.classList.toggle('is-active', active);
      segment.setAttribute('aria-pressed', String(active));
    });
  }

  function updateOutput() {
    const text = inputArea.value;
    const platform = platformSelect.value as KeyboardPlatform;
    const result = convertKeyboardLayout(text, { mode, platform });
    outputArea.value = result.fixedText;
    characterCount.textContent = String([...text].length);
    copyBtn.disabled = !result.fixedText;
    clearBtn.disabled = !text;
    void chrome.storage.local.set({ platform, mode });
  }

  segments.forEach((segment) => segment.addEventListener('click', () => {
    if (!isMode(segment.dataset.mode)) return;
    mode = segment.dataset.mode;
    updateModeButtons();
    updateOutput();
  }));
  inputArea.addEventListener('input', updateOutput);
  platformSelect.addEventListener('change', updateOutput);

  copyBtn.addEventListener('click', async () => {
    if (!outputArea.value) return;
    try {
      await navigator.clipboard.writeText(outputArea.value);
      const label = copyBtn.querySelector<HTMLElement>('[data-i18n]');
      if (label) label.textContent = messages[language].copiedButton;
      copyBtn.classList.add('is-copied');
      window.setTimeout(() => {
        if (label) label.textContent = messages[language].copyButton;
        copyBtn.classList.remove('is-copied');
      }, 1600);
    } catch (error) {
      console.warn('KeyFixer: Could not copy corrected text.', error);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputArea.value = '';
    updateOutput();
    inputArea.focus();
  });

  languageBtn.addEventListener('click', () => {
    language = language === 'ar' ? 'en' : 'ar';
    void chrome.storage.local.set({ uiLanguage: language });
    translate();
  });
  viewLinks.forEach((link) => link.addEventListener('click', () => showView(link.dataset.view as ViewName)));
  backBtn.addEventListener('click', () => showView('home'));

  translate();
  updateModeButtons();
  updateOutput();
});

function isMode(value: unknown): value is ConversionMode {
  return value === 'auto' || value === 'en2ar' || value === 'ar2en';
}

function isLanguage(value: unknown): value is UILanguage {
  return value === 'ar' || value === 'en';
}
