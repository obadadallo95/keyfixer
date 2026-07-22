import { convertKeyboardLayout } from '../../src/core/keyboard';
import { KeyboardPlatform, ConversionMode } from '../../src/core/keyboard/types';

document.addEventListener('DOMContentLoaded', async () => {
  const inputArea = document.getElementById('input-area') as HTMLTextAreaElement;
  const outputArea = document.getElementById('output-area') as HTMLTextAreaElement;
  const modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
  const platformSelect = document.getElementById('platform-select') as HTMLSelectElement;
  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

  // Load saved layout & mode preferences only (no text storage for 100% privacy)
  const prefs = await chrome.storage.local.get(['platform', 'mode']);
  if (prefs.platform) platformSelect.value = prefs.platform;
  if (prefs.mode) modeSelect.value = prefs.mode;

  function updateOutput() {
    const text = inputArea.value;
    const mode = modeSelect.value as ConversionMode;
    const platform = platformSelect.value as KeyboardPlatform;

    const result = convertKeyboardLayout(text, { mode, platform });
    outputArea.value = result.fixedText;
    
    // Save user preferences (platform and mode only)
    chrome.storage.local.set({ platform, mode });
  }

  inputArea.addEventListener('input', updateOutput);
  modeSelect.addEventListener('change', updateOutput);
  platformSelect.addEventListener('change', updateOutput);

  copyBtn.addEventListener('click', async () => {
    if (outputArea.value) {
      await navigator.clipboard.writeText(outputArea.value);
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputArea.value = '';
    outputArea.value = '';
    inputArea.focus();
  });
});

