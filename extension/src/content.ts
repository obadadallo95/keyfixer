chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'replaceText') {
    const { fixed } = request;
    const activeElem = document.activeElement as HTMLElement;

    let replaced = false;

    if (activeElem) {
      if (activeElem instanceof HTMLInputElement || activeElem instanceof HTMLTextAreaElement) {
        const start = activeElem.selectionStart || 0;
        const end = activeElem.selectionEnd || 0;
        const val = activeElem.value;
        
        activeElem.value = val.substring(0, start) + fixed + val.substring(end);
        activeElem.selectionStart = activeElem.selectionEnd = start + fixed.length;
        
        // Dispatch event for React/Angular/Vue
        activeElem.dispatchEvent(new Event('input', { bubbles: true }));
        activeElem.dispatchEvent(new Event('change', { bubbles: true }));
        replaced = true;
      } else if (activeElem.isContentEditable) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(fixed));
          // Move cursor to the end
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          
          activeElem.dispatchEvent(new Event('input', { bubbles: true }));
          replaced = true;
        } else {
          // Fallback to execCommand for content editable if range fails
          document.execCommand('insertText', false, fixed);
          replaced = true;
        }
      }
    }

    if (!replaced) {
      copyToClipboardAndToast(fixed, `KeyFixer: Could not replace text inline. Copied "${fixed}" to clipboard!`);
    } else {
      showToast('KeyFixer: Replaced in field!');
    }
  } else if (request.action === 'copyText') {
    const { fixed } = request;
    copyToClipboardAndToast(fixed, `KeyFixer: Copied "${fixed}" to clipboard!`);
  }
});

function copyToClipboardAndToast(text: string, toastMessage: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(toastMessage);
    }).catch(err => {
      console.error('KeyFixer: Could not copy text', err);
      showToast('KeyFixer: Failed to copy to clipboard.');
    });
  } else {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(toastMessage);
    } catch (err) {
      console.error('KeyFixer fallback copy failed', err);
      showToast('KeyFixer: Failed to copy to clipboard.');
    }
    textArea.remove();
  }
}

function showToast(message: string) {
  let toast = document.getElementById('keyfixer-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'keyfixer-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #f59e0b;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 2147483647;
      border: 1px solid #d97706;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  
  // Clear any existing timeout
  if ((window as any)._keyfixerToastTimeout) {
    clearTimeout((window as any)._keyfixerToastTimeout);
  }
  
  (window as any)._keyfixerToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}
