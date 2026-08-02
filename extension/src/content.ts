type KeyFixerWindow = Window & { __keyfixerContentReady?: boolean; __keyfixerToastTimeout?: number };

const keyFixerWindow = window as KeyFixerWindow;

if (!keyFixerWindow.__keyfixerContentReady) {
  keyFixerWindow.__keyfixerContentReady = true;
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'replaceText') replaceSelectedText(request.fixed);
    if (request.action === 'copyText') copyToClipboardAndToast(request.fixed, message('toastCopied'));
  });
}

function replaceSelectedText(fixed: string) {
  const activeElement = document.activeElement as HTMLElement | null;
  let replaced = false;

  if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
    const start = activeElement.selectionStart ?? 0;
    const end = activeElement.selectionEnd ?? start;
    const newValue = activeElement.value.substring(0, start) + fixed + activeElement.value.substring(end);
    const prototype = activeElement instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (valueSetter) valueSetter.call(activeElement, newValue);
    else activeElement.value = newValue;

    activeElement.selectionStart = activeElement.selectionEnd = start + fixed.length;
    activeElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: fixed }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    replaced = true;
  } else if (activeElement?.isContentEditable) {
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const preText = selection.toString();
      const success = document.execCommand('insertText', false, fixed);
      
      // Verify that execCommand succeeded and didn't fail silently
      if (success) {
        replaced = true;
      }
    }
  }

  if (replaced) showToast(message('toastCorrected'));
  else copyToClipboardAndToast(fixed, message('toastCopied'));
}

function message(key: 'toastCorrected' | 'toastCopied' | 'toastCopyFailed') {
  const localized = chrome.i18n.getMessage(key);
  return localized || {
    toastCorrected: 'KeyFixer: Text corrected.',
    toastCopied: 'KeyFixer: Corrected text copied.',
    toastCopyFailed: 'KeyFixer: Could not copy the corrected text.',
  }[key];
}

function copyToClipboardAndToast(text: string, toastMessage: string) {
  navigator.clipboard.writeText(text).then(
    () => showToast(toastMessage),
    () => fallbackCopy(text, toastMessage),
  );
}

function fallbackCopy(text: string, toastMessage: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.cssText = 'position:fixed;left:-999999px;top:0;opacity:0;';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(toastMessage);
  } catch {
    showToast(message('toastCopyFailed'));
  } finally {
    textArea.remove();
  }
}

function showToast(text: string) {
  let toast = document.getElementById('keyfixer-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'keyfixer-toast';
    toast.setAttribute('role', 'status');
    toast.style.cssText = [
      'position:fixed', 'right:24px', 'bottom:24px', 'z-index:2147483647',
      'max-width:min(360px,calc(100vw - 48px))', 'padding:11px 15px',
      'border:1px solid #6b4a13', 'border-radius:9px', 'background:#1b1c1f',
      'color:#f7ae2b', 'box-shadow:0 12px 32px rgba(0,0,0,.34)',
      'font:600 13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif',
      'direction:auto', 'opacity:0', 'transition:opacity .18s ease', 'pointer-events:none',
    ].join(';');
    document.documentElement.appendChild(toast);
  }

  toast.textContent = text;
  toast.style.opacity = '1';
  if (keyFixerWindow.__keyfixerToastTimeout) clearTimeout(keyFixerWindow.__keyfixerToastTimeout);
  keyFixerWindow.__keyfixerToastTimeout = window.setTimeout(() => { if (toast) toast.style.opacity = '0'; }, 2600);
}
