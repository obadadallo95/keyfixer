import { convertKeyboardLayout } from '../../src/core/keyboard';
import { KeyboardPlatform, ConversionMode } from '../../src/core/keyboard/types';

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
  
  // Retrieve saved platform and mode preferences
  const storageResult = await chrome.storage.local.get(['platform', 'mode']);
  const platform = (storageResult.platform as KeyboardPlatform) || 'windows';
  const mode = (storageResult.mode as ConversionMode) || 'auto';

  const result = convertKeyboardLayout(info.selectionText, { mode, platform });
  const fixed = result.fixedText;

  const actionType = info.menuItemId === 'keyfixer-convert' ? 'replaceText' : 'copyText';

  chrome.tabs.sendMessage(tab.id, {
    action: actionType,
    original: info.selectionText,
    fixed: fixed
  }).catch((error) => {
    console.warn('KeyFixer: Could not send message to active tab (restricted page or script unattached):', error);
  });
});

