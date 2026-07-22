import { convertKeyboardLayout } from '../../src/core/keyboard';
import { KeyboardPlatform } from '../../src/core/keyboard/types';

// Register Context Menu Actions on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'keyfixer-convert',
    title: '🔤 Fix Keyboard Layout (KeyFixer)',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'keyfixer-copy-fixed',
    title: '📋 Fix & Copy to Clipboard',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;
  
  // Try to load saved platform preference, default to windows
  const storageResult = await chrome.storage.local.get(['platform']);
  const platform = (storageResult.platform as KeyboardPlatform) || 'windows';

  const result = convertKeyboardLayout(info.selectionText, { mode: 'auto', platform });
  const fixed = result.fixedText;

  if (info.menuItemId === 'keyfixer-convert') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'replaceText',
      original: info.selectionText,
      fixed: fixed
    });
  } else if (info.menuItemId === 'keyfixer-copy-fixed') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'copyText',
      original: info.selectionText,
      fixed: fixed
    });
  }
});
