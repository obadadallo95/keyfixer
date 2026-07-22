/**
 * @file FloatingKeyFixer.tsx
 * @description Collapsible Document Picture-in-Picture floating window manager for KeyFixer.
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { UILanguage } from '../types';
import { convertKeyboardLayout } from '../core/keyboard';
import { ConversionMode, KeyboardPlatform } from '../core/keyboard/types';
import { translations } from '../i18n/translations';
import {
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  Trash2,
  Laptop,
  Command,
} from 'lucide-react';

interface FloatingKeyFixerContentProps {
  lang: UILanguage;
  onClose: () => void;
  pipWindow: Window;
}

export const FloatingKeyFixerContent: React.FC<FloatingKeyFixerContentProps> = ({
  lang,
  onClose,
  pipWindow,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('auto');
  const [platform, setPlatform] = useState<KeyboardPlatform>('windows');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[lang].converter;

  // Perform conversion using core engine
  const conversionResult = convertKeyboardLayout(input, { mode, platform });
  const outputText = conversionResult.fixedText;

  // Handle window resizing and CSS classes on state change
  useEffect(() => {
    const doc = pipWindow.document;

    if (isCollapsed) {
      doc.body.classList.remove('pip-expanded');
      doc.body.classList.add('pip-collapsed');

      requestAnimationFrame(() => {
        try {
          pipWindow.resizeTo(260, 56);
        } catch (err) {
          console.warn('pipWindow.resizeTo failed:', err);
        }
        setTimeout(() => {
          console.log('PiP Window Size (Collapsed):', pipWindow.innerWidth, pipWindow.innerHeight);
        }, 150);
      });
    } else {
      doc.body.classList.remove('pip-collapsed');
      doc.body.classList.add('pip-expanded');

      requestAnimationFrame(() => {
        try {
          pipWindow.resizeTo(400, 520);
        } catch (err) {
          console.warn('pipWindow.resizeTo failed:', err);
        }
        setTimeout(() => {
          console.log('PiP Window Size (Expanded):', pipWindow.innerWidth, pipWindow.innerHeight);
          textareaRef.current?.focus();
        }, 150);
      });
    }
  }, [isCollapsed, pipWindow]);

  // Sync document direction and dark mode
  useEffect(() => {
    const doc = pipWindow.document;
    doc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    doc.documentElement.classList.add('dark');
  }, [lang, pipWindow]);

  // Global keyboard shortcuts in PiP window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isCollapsed) {
          setIsCollapsed(true);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (outputText && !isCollapsed) {
          e.preventDefault();
          handleCopy();
        }
      }
    };

    pipWindow.addEventListener('keydown', handleKeyDown);
    return () => pipWindow.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, outputText, pipWindow]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInput('');
    textareaRef.current?.focus();
  };

  return (
    <div
      className={`pip-wrapper w-full bg-[#050505] text-slate-200 flex font-sans selection:bg-amber-500 selection:text-black ${
        isCollapsed
          ? 'pip-collapsed h-[56px] px-3 py-0 flex-row items-center justify-between overflow-hidden'
          : 'pip-expanded h-full p-3 flex-col justify-between'
      }`}
    >
      {/* Header / Compact Pill Bar */}
      <div
        className={`pip-header flex items-center justify-between ${
          isCollapsed ? 'w-full h-full border-none p-0' : 'border-b border-slate-800/80 pb-2 mb-2'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="KeyFixer Logo" className="w-3.5 h-3.5 object-contain" />
          </div>
          <span className="text-xs font-black tracking-tight text-white truncate">
            KeyFixer
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setPlatform(p => (p === 'windows' ? 'mac' : 'windows'))}
              className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title={platform === 'windows' ? t.windowsPlatform : t.macPlatform}
            >
              {platform === 'windows' ? (
                <Laptop className="w-3 h-3 text-blue-400" />
              ) : (
                <Command className="w-3 h-3 text-amber-400" />
              )}
              <span>{platform === 'windows' ? 'Win' : 'Mac'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? (lang === 'ar' ? 'توسيع النافذة' : 'Expand window') : (lang === 'ar' ? 'طي النافذة' : 'Collapse window')}
            title={isCollapsed ? 'Expand' : 'Collapse (Esc)'}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close window'}
            title={lang === 'ar' ? 'إغلاق' : 'Close'}
            className="p-1 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content - completely removed from layout when collapsed */}
      {!isCollapsed && (
        <>
          {/* Mode Selector */}
          <div className="mode-selector flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80 mb-2">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                mode === 'auto'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.autoMode}
            </button>
            <button
              type="button"
              onClick={() => setMode('en2ar')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                mode === 'en2ar'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.enToArMode}
            </button>
            <button
              type="button"
              onClick={() => setMode('ar2en')}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                mode === 'ar2en'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.arToEnMode}
            </button>
          </div>

          {/* Input & Output Editor Container */}
          <div className="editor-container flex-1 flex flex-col min-h-0 gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              dir="auto"
              className="w-full flex-1 p-2.5 bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none font-mono"
            />

            {/* Output Box */}
            <div className="relative min-h-[90px] p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col justify-between">
              <div
                className="text-xs text-amber-200/90 font-sans font-medium min-h-[40px] break-words whitespace-pre-wrap"
                dir="auto"
              >
                {outputText || <span className="text-slate-600 italic text-[11px]">{t.outputPlaceholder}</span>}
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between border-t border-amber-500/10 pt-2 mt-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  {outputText ? `${outputText.length} ${t.chars}` : t.latency}
                </span>

                <div className="flex items-center gap-1.5">
                  {input && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition-colors flex items-center gap-1"
                      title={t.clear}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!outputText}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                      copied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : outputText
                        ? 'bg-amber-500 text-black hover:bg-amber-400 font-black'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.copy}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pip-footer mt-2 pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>Esc: {lang === 'ar' ? 'طي' : 'Collapse'}</span>
            <span>Ctrl/Cmd+Enter: {t.copy}</span>
          </div>
        </>
      )}
    </div>
  );
};

// ── WINDOW MANAGER FUNCTION ──
let activePipWindow: Window | null = null;
let activePipRoot: ReactDOM.Root | null = null;

export const openFloatingKeyFixerWindow = async (lang: UILanguage) => {
  if (!('documentPictureInPicture' in window)) {
    alert(
      lang === 'ar'
        ? 'عذراً، متصفحك لا يدعم خاصية النوافذ العائمة (Document Picture-in-Picture). يرجى استخدام متصفح Chrome أو Edge.'
        : 'Document Picture-in-Picture is not supported by your browser. Please use Chrome or Edge.'
    );
    return;
  }

  // If already open, focus existing window
  if (activePipWindow && !activePipWindow.closed) {
    activePipWindow.focus();
    return;
  }

  try {
    const pipWindow: Window = await (window as any).documentPictureInPicture.requestWindow({
      width: 400,
      height: 520,
    });

    activePipWindow = pipWindow;

    // Copy styles from main document to PiP window with zero memory overhead
    const pipDoc = pipWindow.document;
    pipDoc.head.innerHTML = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      pipDoc.head.appendChild(node.cloneNode(true));
    });

    // Inject strict collapse/expand stylesheet rules into PiP document head
    const styleEl = pipDoc.createElement('style');
    styleEl.textContent = `
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      body.pip-collapsed {
        height: 56px !important;
        min-height: 0 !important;
        max-height: 56px !important;
        overflow: hidden !important;
      }
      body.pip-expanded {
        height: 100% !important;
      }
      .pip-collapsed .editor-container,
      .pip-collapsed .pip-footer,
      .pip-collapsed .mode-selector {
        display: none !important;
      }
      .pip-collapsed .pip-wrapper {
        height: 56px !important;
        min-height: 0 !important;
        max-height: 56px !important;
      }
    `;
    pipDoc.head.appendChild(styleEl);

    // Configure PiP Document
    pipDoc.title = 'KeyFixer Floating';
    pipDoc.documentElement.classList.add('dark');
    pipDoc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    pipDoc.body.className = 'pip-expanded bg-[#050505] m-0 p-0 overflow-hidden text-slate-200 font-sans';

    // Mount React Root
    const container = pipDoc.createElement('div');
    container.id = 'pip-root';
    container.className = 'w-full h-full';
    pipDoc.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    activePipRoot = root;

    const handleClose = () => {
      if (activePipRoot) {
        activePipRoot.unmount();
        activePipRoot = null;
      }
      if (activePipWindow && !activePipWindow.closed) {
        activePipWindow.close();
      }
      activePipWindow = null;
    };

    pipWindow.addEventListener('pagehide', handleClose);

    root.render(
      <FloatingKeyFixerContent
        lang={lang}
        onClose={handleClose}
        pipWindow={pipWindow}
      />
    );
  } catch (err) {
    console.error('Failed to open Picture-in-Picture window:', err);
  }
};
