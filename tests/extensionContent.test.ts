// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Chrome Extension Content Script', () => {
  let listeners: any[] = [];
  
  beforeEach(() => {
    document.body.innerHTML = '';
    listeners = [];
    
    // Mock chrome API
    (global as any).chrome = {
      runtime: {
        onMessage: {
          addListener: (fn: any) => listeners.push(fn)
        }
      },
      i18n: {
        getMessage: (key: string) => {
          const msgs: Record<string, string> = {
            toastCorrected: 'Corrected',
            toastCopied: 'Copied',
            toastCopyFailed: 'Copy Failed'
          };
          return msgs[key];
        }
      }
    };
    
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    // Mock document.execCommand for JSDOM
    document.execCommand = vi.fn();

    // Reset module so it re-evaluates
    vi.resetModules();
  });

  const loadContentScript = async () => {
    (window as any).__keyfixerContentReady = false;
    await import('../extension/src/content.ts');
  };

  const simulateMessage = (action: string, fixed: string) => {
    listeners.forEach(listener => listener({ action, fixed }));
  };

  it('replaces text in input elements and maintains selection', async () => {
    await loadContentScript();
    
    const input = document.createElement('input');
    input.value = 'hello';
    document.body.appendChild(input);
    input.focus();
    
    // Select "ll"
    input.setSelectionRange(2, 4);
    
    simulateMessage('replaceText', 'xx');
    
    expect(input.value).toBe('hexxo');
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
  });

  it('uses execCommand for contenteditable elements if available', async () => {
    await loadContentScript();
    
    const div = document.createElement('div');
    div.contentEditable = 'true';
    Object.defineProperty(div, 'isContentEditable', { get: () => true });
    div.innerHTML = 'hello';
    document.body.appendChild(div);
    
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(div);
    
    // Mock execCommand
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockImplementation((cmd, showUI, value) => {
      if (cmd === 'insertText') {
        div.innerHTML = div.innerHTML.replace('ll', value as string);
        return true;
      }
      return false;
    });

    // Mock getSelection
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: () => ({}),
      toString: () => 'll'
    };
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
    
    simulateMessage('replaceText', 'xx');
    
    expect(execCommandSpy).toHaveBeenCalledWith('insertText', false, 'xx');
    expect(div.innerHTML).toBe('hexxo');
  });

  it('falls back to clipboard copy if execCommand fails in contenteditable', async () => {
    await loadContentScript();
    
    const div = document.createElement('div');
    div.contentEditable = 'true';
    Object.defineProperty(div, 'isContentEditable', { get: () => true });
    div.innerHTML = 'hello';
    document.body.appendChild(div);
    
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(div);
    
    // Mock execCommand to fail
    vi.spyOn(document, 'execCommand').mockReturnValue(false);

    const mockSelection = {
      rangeCount: 1,
      getRangeAt: () => ({}),
      toString: () => 'll'
    };
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
    
    simulateMessage('replaceText', 'xx');
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('xx');
  });
});
