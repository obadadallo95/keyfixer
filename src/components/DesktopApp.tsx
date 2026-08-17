import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { convertKeyboardLayout } from '../core/keyboard';
import { ConversionMode } from '../core/keyboard/types';
import { translations } from '../i18n/translations';
import { UILanguage } from '../types';
import { Copy, Check, ExternalLink, Keyboard, ShieldCheck, Trash2, X, Volume2, VolumeX, Languages } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWindow } from '@tauri-apps/api/window';
import * as tauriEvent from '@tauri-apps/api/event';
import * as tauriClipboard from '@tauri-apps/plugin-clipboard-manager';
import { getProBridge, getProPanel } from '../pro/bridge';
import { LegalViewerModal } from './LegalViewerModal';
import { LegalDocId } from '../legal/legalContent';
import './DesktopApp.css';
import { Onboarding, ONBOARDING_STORAGE_KEY } from './Onboarding';

const FONT_SYS = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"SF Mono", ui-monospace, Menlo, monospace';
const FONT_WINDOWS = '"Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';
const FONT_MONO_WINDOWS = '"Cascadia Mono", Consolas, ui-monospace, monospace';
const SUPPORT_URL = 'https://obadadallo.web.app/contact/';

function playSystemSound(type: 'paste' | 'copy') {
  invoke('play_feedback_sound', { soundType: type }).catch(() => {});
}

function HeaderLogo({ isDark, proStatus }: { isDark: boolean; proStatus?: 'pro' | 'trial' | 'free' }) {
  return (
    <span
      dir="ltr"
      style={{
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        fontFamily: FONT_SYS,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* App name always first on left */}
      <span>
        <span style={{ color: isDark ? '#FFFFFF' : '#1C1C1E' }}>Key</span>
        <span style={{ color: isDark ? '#F59E0B' : '#D97706' }}>Fixer</span>
      </span>

      {/* Pro badge to the RIGHT of the name */}
      {proStatus === 'pro' && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#171717',
            padding: '2px 8px',
            borderRadius: 6,
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
            letterSpacing: '0.02em',
          }}
        >
          Pro
        </span>
      )}

      {proStatus === 'trial' && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            background: 'rgba(245, 158, 11, 0.18)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '2px 8px',
            borderRadius: 6,
            letterSpacing: '0.02em',
          }}
        >
          Trial
        </span>
      )}
    </span>
  );
}

export function DesktopApp() {
  const proBridge = useMemo(() => getProBridge(), []);
  const ProPanelComponent = useMemo(() => getProPanel(), []);

  const platform = useMemo<'windows' | 'mac'>(() => {
    return navigator.userAgent.includes('Windows') ? 'windows' : 'mac';
  }, []);
  const isWindows = platform === 'windows';

  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const T = useMemo(() => {
    if (isWindows && isDark) {
      return {
        bg: '#202020',
        toolbarBg: '#202020',
        surface: '#2B2B2B',
        segmentedBg: '#2B2B2B',
        inputBg: '#1C1C1C',
        outputBg: '#252525',
        border: '#454545',
        text1: '#F5F5F5',
        text2: '#B7B7B7',
        accent: '#F59E0B',
        accentHover: '#D98200',
        accentDim: '#302817',
        focus: 'rgba(245,158,11,0.3)',
        disabledBg: '#343434',
        disabledText: '#858585',
        btnText: '#171717',
        logoInvert: 0,
      };
    }

    if (isWindows) {
      return {
        bg: '#F3F3F3',
        toolbarBg: '#F3F3F3',
        surface: '#FFFFFF',
        segmentedBg: '#E9E9E9',
        inputBg: '#FFFFFF',
        outputBg: '#FAFAFA',
        border: '#D1D1D1',
        text1: '#1B1B1B',
        text2: '#5D5D5D',
        accent: '#B45309',
        accentHover: '#92400E',
        accentDim: '#FFF4E5',
        focus: 'rgba(180,83,9,0.3)',
        disabledBg: '#E5E5E5',
        disabledText: '#8A8A8A',
        btnText: '#FFFFFF',
        logoInvert: 1,
      };
    }

    if (isDark) {
      return {
        bg: '#1E1E1E',
        toolbarBg: 'rgba(30,30,30,0.8)',
        surface: '#2D2D2D',
        segmentedBg: 'rgba(0,0,0,0.25)',
        inputBg: 'rgba(0,0,0,0.2)',
        outputBg: 'rgba(0,0,0,0.2)',
        border: 'rgba(255,255,255,0.08)',
        text1: 'rgba(255,255,255,0.92)',
        text2: 'rgba(255,255,255,0.5)',
        accent: 'rgb(245,158,11)',
        accentHover: 'rgb(217,130,0)',
        accentDim: 'rgba(245,158,11,0.15)',
        focus: 'rgba(245,158,11,0.3)',
        disabledBg: '#2D2D2D',
        disabledText: 'rgba(255,255,255,0.35)',
        btnText: '#000000',
        logoInvert: 0,
      };
    } else {
      return {
        bg: '#F3F1EC', // slightly deeper off-white for more contrast against white surfaces
        toolbarBg: 'rgba(243,241,236,0.85)',
        surface: '#FFFFFF',
        segmentedBg: 'rgba(217,119,6,0.08)',
        inputBg: '#FCFCFB',
        outputBg: '#FCFCFB',
        border: 'rgba(0,0,0,0.12)', // stronger structural border
        text1: '#1C1C1E', // standard high-contrast dark text
        text2: '#57534E', // darker secondary text
        accent: '#D97706',
        accentHover: '#B85F00',
        accentDim: 'rgba(217,119,6,0.12)',
        focus: 'rgba(217,119,6,0.3)',
        disabledBg: '#FFFFFF',
        disabledText: '#8A817A',
        btnText: '#FFFFFF',
        logoInvert: 1,
      };
    }
  }, [isDark, isWindows]);

  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_ui_language');
    if (saved === 'ar' || saved === 'en') return saved;
    return navigator.language.startsWith('ar') ? 'ar' : 'en';
  });
  const [proStatus, setProStatus] = useState<'pro' | 'trial' | 'free'>('free');
  const handleProStatusChange = useCallback((status: 'pro' | 'trial' | 'free') => {
    setProStatus(status);
  }, []);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('auto');
  const [copied, setCopied] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true');
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocId>('privacy');
  const [appVersion, setAppVersion] = useState('1.1.0');
  const [workflowState, setWorkflowState] = useState<'idle' | 'resultReady'>('idle');
  const [showGlow, setShowGlow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('keyfixer_sound_enabled') === 'true';
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    tauriEvent.listen('show-onboarding', () => setShowOnboarding(true)).then((fn) => { unlisten = fn; }).catch(() => {});
    return () => unlisten?.();
  }, []);

  useEffect(() => {
    const handleOpenDoc = (e: Event) => {
      const customEvent = e as CustomEvent<{ doc?: LegalDocId }>;
      if (customEvent.detail?.doc) {
        setSelectedLegalDoc(customEvent.detail.doc);
      }
      setShowLegalModal(true);
    };
    window.addEventListener('open-legal-doc', handleOpenDoc);
    return () => window.removeEventListener('open-legal-doc', handleOpenDoc);
  }, []);

  useEffect(() => {
    localStorage.setItem('keyfixer_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);



  const stateRef = useRef({
    workflowState: 'idle' as 'idle' | 'resultReady',
    isProcessingShortcut: false,
    outputText: '',
    conversionMode: 'auto' as ConversionMode,
    keyboardPlatform: platform,
    soundEnabled: soundEnabled,
  });

  useEffect(() => {
    stateRef.current.conversionMode = mode;
    stateRef.current.keyboardPlatform = platform;
    stateRef.current.soundEnabled = soundEnabled;
  }, [mode, platform, soundEnabled]);

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => {});
  }, []);

  useEffect(() => {
    const focusInput = () => {
      window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    window.addEventListener('focus', focusInput);
    focusInput();
    return () => window.removeEventListener('focus', focusInput);
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    
    const setupShortcutListener = async () => {
      try {
        if (!isMounted) return;
        const currentWin = getCurrentWindow();
        
        const handleShortcut = async () => {
          if (stateRef.current.isProcessingShortcut) return;
          stateRef.current.isProcessingShortcut = true;
          
          try {
            if (stateRef.current.workflowState === 'idle') {
              let clipboardText = '';
              try {
                clipboardText = await tauriClipboard.readText() || '';
              } catch (err) {}
              
              if (clipboardText && clipboardText.trim().length > 0) {
                const result = convertKeyboardLayout(clipboardText, {
                  mode: stateRef.current.conversionMode,
                  platform: stateRef.current.keyboardPlatform,
                });
                
                setInput(clipboardText);
                setWorkflowState('resultReady');
                
                stateRef.current.outputText = result.fixedText;
                stateRef.current.workflowState = 'resultReady';
                
                if (stateRef.current.soundEnabled) {
                  playSystemSound('paste');
                }
                
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.setSelectionRange(clipboardText.length, clipboardText.length);
                }
              } else {
                if (inputRef.current) inputRef.current.focus();
              }
            } else if (stateRef.current.workflowState === 'resultReady') {
              if (stateRef.current.outputText) {
                let writeSuccess = false;
                try {
                  await tauriClipboard.writeText(stateRef.current.outputText);
                  writeSuccess = true;
                } catch (err) {}
                
                if (writeSuccess) {
                  setCopied(true);
                  setShowGlow(true);
                  if (stateRef.current.soundEnabled) {
                    playSystemSound('copy');
                  }
                  
                  setTimeout(() => {
                    setCopied(false);
                    setShowGlow(false);
                    setInput('');
                    setWorkflowState('idle');
                    stateRef.current.workflowState = 'idle';
                    stateRef.current.outputText = '';
                    invoke('hide_window').catch(() => {});
                  }, 350);
                }
              }
            }
          } finally {
            stateRef.current.isProcessingShortcut = false;
          }
        };

        unlisten = await tauriEvent.listen('shortcut-pressed', handleShortcut);
      } catch (err) {
        // Listener setup error
      }
    };
    
    setupShortcutListener();
    return () => { 
      isMounted = false;
      if (unlisten) {
        try { 
          const res = unlisten() as any;
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      } 
    };
  }, []);

  // Listen for background inline conversion requests and reply with converted text
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    const setupInlineListener = async () => {
      try {
        if (!isMounted) return;
        unlisten = await tauriEvent.listen<{ id: number; text: string }>(
          'inline-convert-request',
          async (event) => {
            const { id, text } = event.payload;
            const result = convertKeyboardLayout(text, {
              mode: stateRef.current.conversionMode,
              platform: stateRef.current.keyboardPlatform,
            });
            proBridge.submitConversionResponse(id, result.fixedText, stateRef.current.soundEnabled).catch(() => {
              console.warn('INLINE_FIX_FAILED:conversion_response');
            });
          }
        );
      } catch {
        console.warn('INLINE_FIX_FAILED:conversion_listener');
      }
    };
    setupInlineListener();
    return () => {
      isMounted = false;
      if (unlisten) {
        try {
          const res = unlisten() as any;
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  // Listen for tauri window focus to auto-select or focus input
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    const setupListener = async () => {
      try {
        if (!isMounted) return;
        unlisten = await tauriEvent.listen('tauri://focus', () => {
          if (inputRef.current && input.length > 0) {
             inputRef.current.select();
          } else if (inputRef.current) {
             inputRef.current.focus();
          }
        });
      } catch (err) {}
    };
    setupListener();
    return () => { 
      isMounted = false;
      if (unlisten) {
        try { 
          const res = unlisten() as any;
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      } 
    };
  }, [input]);

  const isRTL = lang === 'ar';
  const t = translations[lang].converter;

  const handleStartDrag = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      invoke('start_drag').catch(() => {
        try {
          getCurrentWindow().startDragging();
        } catch {}
      });
    }
  }, []);

  const output = useMemo(
    () => convertKeyboardLayout(input, { mode, platform }).fixedText,
    [input, mode, platform]
  );

  const doCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    if (soundEnabled) playSystemSound('copy');
    setTimeout(() => setCopied(false), 1600);
  }, [output, soundEnabled]);

  const doClear = useCallback(() => {
    setInput('');
  }, []);

  // ── Keyboard-First Shortcuts (Esc to dismiss, Cmd+Enter to copy, Cmd+1/2/3 to switch) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Escape: Close modal or dismiss window
      if (e.key === 'Escape') {
        if (showLegalModal) {
          setShowLegalModal(false);
          return;
        }
        if (showOnboarding) {
          setShowOnboarding(false);
          return;
        }
        invoke('hide_window').catch(() => {});
        return;
      }

      // 2. Cmd+Enter / Ctrl+Enter: Quick Copy & Dismiss
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') {
        if (output && output.length > 0) {
          e.preventDefault();
          doCopy();
          setTimeout(() => {
            invoke('hide_window').catch(() => {});
          }, 240);
        }
        return;
      }

      // 3. Cmd+1 / Cmd+2 / Cmd+3: Mode Switch
      if (isCmdOrCtrl && (e.key === '1' || e.key === '2' || e.key === '3')) {
        e.preventDefault();
        if (e.key === '1') setMode('auto');
        else if (e.key === '2') setMode('en2ar');
        else if (e.key === '3') setMode('ar2en');
        return;
      }

      // 4. Shift+Cmd+Delete / Shift+Cmd+Backspace: Clear Input
      if (isCmdOrCtrl && (e.key === 'Backspace' || e.key === 'Delete') && e.shiftKey) {
        e.preventDefault();
        doClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLegalModal, showOnboarding, output, doCopy, doClear]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`desktop-app${isWindows ? ' desktop-app--windows' : ''}`}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: T.bg,
        color: T.text1,
        fontFamily: isWindows ? FONT_WINDOWS : FONT_SYS,
        userSelect: 'none',
        '--kf-accent': T.accent,
        '--kf-accent-hover': T.accentHover,
        '--kf-focus': T.focus,
        '--kf-border': T.border,
        '--kf-surface': T.surface,
        '--kf-text': T.text1,
        '--kf-text-secondary': T.text2,
        '--kf-disabled-bg': T.disabledBg,
        '--kf-disabled-text': T.disabledText,
      } as React.CSSProperties}
    >
      {/* ── TOOLBAR (Drag Region & Traffic Lights Space) ── */}
      {!isWindows && (
        <div
          data-tauri-drag-region
          onMouseDown={handleStartDrag}
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${T.border}`,
            background: T.toolbarBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            flexShrink: 0,
            position: 'relative',
            cursor: 'grab',
          }}
        >
          <HeaderLogo isDark={isDark} proStatus={proStatus} />
        </div>
      )}

      {/* ── LEGAL VIEWER MODAL ── */}
      {showOnboarding && <Onboarding isRTL={isRTL} platform={platform} onDone={() => setShowOnboarding(false)} />}
      <LegalViewerModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialDoc={selectedLegalDoc}
        lang={lang}
        isDark={isDark}
      />

      {/* ── MAIN CONTENT ── */}
      <div
        className="kf-main-content"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isWindows ? 20 : 24, gap: isWindows ? 16 : 20, minHeight: 0, overflow: 'hidden' }}
      >
        {isWindows && (
          <header className="kf-windows-intro">
            <div>
              <h1>{isRTL ? 'تصحيح تخطيط الكتابة' : 'Keyboard layout correction'}</h1>
              <p>
                {isRTL
                  ? 'اكتب النص بالتخطيط الخاطئ، وسيظهر التصحيح فورًا.'
                  : 'Enter text typed with the wrong layout and get the correction instantly.'}
              </p>
            </div>
            <div className="kf-shortcut-badge" title={isRTL ? 'إظهار أو إخفاء KeyFixer' : 'Show or hide KeyFixer'}>
              <Keyboard size={14} aria-hidden="true" />
              <kbd>Ctrl</kbd><span>+</span><kbd>Alt</kbd><span>+</span><kbd>K</kbd>
            </div>
          </header>
        )}
        
        {/* Controls Row */}
        <div className="kf-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {isWindows && <span className="kf-controls-label">{isRTL ? 'اتجاه التحويل' : 'Conversion direction'}</span>}
          
          {/* Conversion Mode Segmented Control */}
          <div className={isWindows ? 'kf-segmented' : undefined} style={{
            display: 'flex',
            background: T.segmentedBg,
            border: `1px solid ${T.border}`,
            padding: 2,
            borderRadius: 8,
          }}>
            {(['auto', 'en2ar', 'ar2en'] as ConversionMode[]).map((m) => {
              const label = m === 'auto' ? t.autoMode : m === 'en2ar' ? t.enToArMode : t.arToEnMode;
              const active = mode === m;
              const shortcutHint = m === 'auto' ? (isWindows ? 'Ctrl+1' : '⌘1') : m === 'en2ar' ? (isWindows ? 'Ctrl+2' : '⌘2') : (isWindows ? 'Ctrl+3' : '⌘3');
              return (
                <button
                  className={isWindows ? `kf-segment${active ? ' kf-segment--active' : ''}` : `kf-segment-btn${active ? ' kf-segment-btn--active' : ''}`}
                  key={m}
                  onClick={() => setMode(m)}
                  title={`${label} (${shortcutHint})`}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    color: active ? (isWindows ? T.btnText : T.text1) : T.text2,
                    background: active ? (isWindows ? T.accent : T.surface) : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: active && !isWindows ? '0 1px 3px rgba(0,0,0,0.14), 0 0.5px 1px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* KeyFixer Pro Button & Options (Right next to Sound Button) */}
            {ProPanelComponent && (
              <ProPanelComponent
                bridge={proBridge}
                isRTL={isRTL}
                lang={lang}
                platform={platform}
                onStatusChange={handleProStatusChange}
                onOpenLegal={(doc) => {
                  setSelectedLegalDoc(doc);
                  setShowLegalModal(true);
                }}
              />
            )}

            {/* Sound Toggle Button (Compact & Sleek) */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSystemSound('copy');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: soundEnabled ? T.accentDim : T.segmentedBg,
                border: `1px solid ${soundEnabled ? T.accent : T.border}`,
                color: soundEnabled ? T.accent : T.text2,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title={
                soundEnabled
                  ? (isRTL ? 'المؤثر الصوتي مفعّل (انقر للتعطيل)' : 'Sound Feedback On (Click to mute)')
                  : (isRTL ? 'المؤثر الصوتي متوقف (انقر للتفعيل)' : 'Sound Feedback Off (Click to enable)')
              }
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>

        {/* Editor Split View */}
        <div className="kf-editors" style={{ flex: 1, display: 'flex', gap: isWindows ? 14 : 20, minHeight: 0, overflow: 'hidden' }}>
          
          {/* INPUT AREA */}
          <div className="kf-editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, textTransform: isWindows ? 'none' : 'uppercase', letterSpacing: isWindows ? 0 : '0.05em' }}>
                {isRTL ? 'النص الأصلي' : 'Input'}
              </span>
              <button
                className={isWindows ? 'kf-clear-button' : undefined}
                onClick={doClear}
                disabled={!input}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, color: input ? T.text2 : 'transparent',
                  background: 'none', border: 'none', cursor: input ? 'pointer' : 'default',
                  transition: 'color 0.2s',
                }}
              >
                <Trash2 size={12} /> {t.clear}
              </button>
            </div>
            <textarea
              className="kf-editor kf-editor-input"
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              dir="auto"
              spellCheck={false}
              style={{
                flex: 1,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: isWindows ? FONT_MONO_WINDOWS : FONT_MONO,
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: isWindows ? 7 : 10,
                color: T.text1,
                WebkitTextFillColor: T.text1,
                caretColor: T.text1,
                resize: 'none',
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
                boxSizing: 'border-box',
                outline: 'none',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)',
                transition: 'border-color 0.2s',
              }}
              onFocus={isWindows ? undefined : e => (e.target.style.borderColor = T.accent)}
              onBlur={isWindows ? undefined : e => (e.target.style.borderColor = T.border)}
            />
          </div>

          {/* OUTPUT AREA */}
          <div className="kf-editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, textTransform: isWindows ? 'none' : 'uppercase', letterSpacing: isWindows ? 0 : '0.05em' }}>
                {isRTL ? 'النتيجة' : 'Output'}
              </span>
              <span style={{ fontSize: 11, color: T.text2, fontFamily: isWindows ? FONT_MONO_WINDOWS : FONT_MONO }}>
                {output ? `${output.length} ${t.chars}` : ''}
              </span>
            </div>
            <div
              className="kf-editor kf-editor-output"
              dir="auto"
              style={{
                flex: 1,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: isWindows ? FONT_MONO_WINDOWS : FONT_MONO,
                background: output ? T.accentDim : (isWindows ? T.outputBg : T.inputBg),
                border: `1px solid ${output ? T.accent : T.border}`,
                borderRadius: isWindows ? 7 : 10,
                color: output ? T.text1 : T.text2,
                WebkitTextFillColor: output ? T.text1 : T.text2,
                overflowY: 'auto',
                overflowX: 'hidden',
                overflowWrap: 'anywhere',
                whiteSpace: 'pre-wrap',
                minWidth: 0,
                minHeight: 0,
                boxSizing: 'border-box',
                boxShadow: showGlow ? `0 0 15px ${T.focus}` : 'inset 0 1px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.3s ease, border-color 0.2s, background-color 0.2s',
                userSelect: 'text',
              }}
            >
              {output || t.outputPlaceholder}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="kf-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
          {/* Developer Info */}
          <div className="kf-footer-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.text2, opacity: isWindows ? 1 : 0.6, letterSpacing: '0.02em', userSelect: 'none' }}>
            <span>KeyFixer v{appVersion}</span>
            <span>&bull;</span>
            <span title="Global shortcut">{platform === 'windows' ? 'Ctrl+Alt+K' : '⌥⌘K'}</span>
            <span>&bull;</span>
            <span>By Obada Dallo</span>
            <span>&bull;</span>
            <button
              className={isWindows ? 'kf-legal-button' : undefined}
              type="button"
              onClick={() => {
                setSelectedLegalDoc('privacy');
                setShowLegalModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
            >
              <ShieldCheck size={12} /> {isRTL ? 'القانونية' : 'Legal'}
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
            >
              {isRTL ? 'دليل الاستخدام' : 'Guide'}
            </button>
          </div>

          <button
            className={isWindows ? 'kf-copy-button' : undefined}
            onClick={doCopy}
            disabled={!output}
            title={output ? (isWindows ? (isRTL ? 'نسخ النص المصحح (Ctrl+Enter)' : 'Copy Fixed Text (Ctrl+Enter)') : (isRTL ? 'نسخ النص المصحح (⌘ + Enter)' : 'Copy Fixed Text (⌘ + Enter)')) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              color: copied ? '#FFFFFF' : output ? T.btnText : (isWindows ? T.disabledText : T.btnText),
              background: copied ? (isWindows ? '#107C10' : '#34C759') : output ? T.accent : (isWindows ? T.disabledBg : T.surface),
              border: isWindows ? `1px solid ${output ? T.accent : T.border}` : 'none',
              borderRadius: isWindows ? 6 : 8,
              cursor: output ? 'pointer' : 'not-allowed',
              opacity: isWindows ? 1 : output ? 1 : 0.5,
              transition: 'all 0.2s',
              boxShadow: output && !isWindows ? '0 2px 8px rgba(245,158,11,0.25)' : 'none',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>

      </div>
    </div>
  );
}
