import { convertKeyboardLayout } from '../../src/core/keyboard';
import { KeyboardPlatform, ConversionMode } from '../../src/core/keyboard/types';

type UILanguage = 'ar' | 'en';

const menuLabels = {
  en: {
    replace: 'Fix selected text with KeyFixer',
    copy: 'Fix and copy corrected text',
  },
  ar: {
    replace: 'تصحيح النص المحدد باستخدام KeyFixer',
    copy: 'تصحيح النص ونسخ النتيجة',
  },
} as const;

chrome.runtime.onInstalled.addListener(() => void registerContextMenus());
chrome.runtime.onStartup.addListener(() => void registerContextMenus());
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.uiLanguage) void registerContextMenus();
});

async function getLanguage(): Promise<UILanguage> {
  const result = await chrome.storage.local.get('uiLanguage');
  if (result.uiLanguage === 'ar' || result.uiLanguage === 'en') return result.uiLanguage;
  return chrome.i18n.getUILanguage().toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

async function registerContextMenus() {
  const language = await getLanguage();
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: 'keyfixer-convert',
    title: menuLabels[language].replace,
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'keyfixer-copy-fixed',
    title: menuLabels[language].copy,
    contexts: ['selection'],
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  const storageResult = await chrome.storage.local.get(['platform', 'mode']);
  const platform = (storageResult.platform as KeyboardPlatform) || 'windows';
  const mode = (storageResult.mode as ConversionMode) || 'auto';
  const result = convertKeyboardLayout(info.selectionText, { mode, platform });
  const action = info.menuItemId === 'keyfixer-convert' ? 'replaceText' : 'copyText';

  try {
    // activeTab grants access only after this explicit user action. The content
    // helper is injected on demand instead of running on every visited page.
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    await chrome.tabs.sendMessage(tab.id, {
      action,
      original: info.selectionText,
      fixed: result.fixedText,
    });
  } catch (error) {
    console.warn('KeyFixer: This browser page does not allow extension scripts.', error);
  }
});
