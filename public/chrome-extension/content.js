/**
 * KeyFixer Content Script
 * Receives fixed text from context menu and replaces active input text or displays toast notification.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'replaceOrShowText') {
    const { fixed } = request;
    const activeElem = document.activeElement;

    // Replace if in editable input / textarea / contenteditable
    if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA')) {
      const start = activeElem.selectionStart;
      const end = activeElem.selectionEnd;
      const val = activeElem.value;
      activeElem.value = val.substring(0, start) + fixed + val.substring(end);
      activeElem.selectionStart = activeElem.selectionEnd = start + fixed.length;
      showToast('KeyFixer: Replaced in field!');
    } else if (activeElem && activeElem.isContentEditable) {
      document.execCommand('insertText', false, fixed);
      showToast('KeyFixer: Replaced text!');
    } else {
      // Copy to clipboard and show floating toast banner
      navigator.clipboard.writeText(fixed).then(() => {
        showToast(`KeyFixer Fixed: "${fixed}" (Copied to Clipboard!)`);
      });
    }
  }
});

function showToast(message) {
  let toast = document.getElementById('keyfixer-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'keyfixer-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #111827;
      color: #38bdf8;
      padding: 12px 20px;
      border-radius: 10px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 999999;
      border: 1px solid #0284c7;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3500);
}
