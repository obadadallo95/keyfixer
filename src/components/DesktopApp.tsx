import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { convertKeyboardLayout } from '../core/keyboard';
import { ConversionMode } from '../core/keyboard/types';
import { translations } from '../i18n/translations';
import { UILanguage } from '../types';
import { Copy, Check, ShieldCheck, Trash2, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWindow } from '@tauri-apps/api/window';

const FONT_SYS = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"SF Mono", ui-monospace, Menlo, monospace';
const SUPPORT_URL = 'https://obadadallo.web.app/contact/';

function HeaderLogo({ isDark }: { isDark: boolean }) {
  return (
    <span
      style={{
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        fontFamily: FONT_SYS,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <span style={{ color: isDark ? '#FFFFFF' : '#1C1C1E' }}>Key</span>
      <span style={{ color: isDark ? '#F59E0B' : '#D97706' }}>Fixer</span>
    </span>
  );
}

export function DesktopApp() {
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
    if (isDark) {
      return {
        bg: '#1E1E1E',
        toolbarBg: 'rgba(30,30,30,0.8)',
        surface: '#2D2D2D',
        segmentedBg: 'rgba(0,0,0,0.25)',
        inputBg: 'rgba(0,0,0,0.2)',
        border: 'rgba(255,255,255,0.08)',
        text1: 'rgba(255,255,255,0.92)',
        text2: 'rgba(255,255,255,0.5)',
        accent: 'rgb(245,158,11)',
        accentDim: 'rgba(245,158,11,0.15)',
        btnText: '#000000',
        logoInvert: 0,
      };
    } else {
      return {
        bg: '#F5F5F7',
        toolbarBg: 'rgba(255,255,255,0.85)',
        surface: '#FFFFFF',
        segmentedBg: 'rgba(0,0,0,0.05)',
        inputBg: '#FFFFFF',
        border: 'rgba(0,0,0,0.08)',
        text1: '#1C1C1E',
        text2: '#636366',
        accent: '#D97706',
        accentDim: 'rgba(217,119,6,0.1)',
        btnText: '#FFFFFF',
        logoInvert: 1,
      };
    }
  }, [isDark]);

  const [lang] = useState<UILanguage>(() => {
    return navigator.language.startsWith('ar') ? 'ar' : 'en';
  });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('auto');
  const [copied, setCopied] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [appVersion, setAppVersion] = useState('1.1.0');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (!showLegal) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLegal(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showLegal]);

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
    () => convertKeyboardLayout(input, { mode, platform: 'mac' }).fixedText,
    [input, mode]
  );

  const doCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [output]);

  const doClear = useCallback(() => {
    setInput('');
  }, []);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: T.bg,
        color: T.text1,
        fontFamily: FONT_SYS,
        userSelect: 'none',
      }}
    >
      {/* ── TOOLBAR (Drag Region & Traffic Lights Space) ── */}
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
        {/* Centered Dynamic Logo */}
        <HeaderLogo isDark={isDark} />
      </div>

      {showLegal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLegal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            background: 'rgba(0,0,0,0.62)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <section
            style={{
              width: 'min(620px, 100%)',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: 24,
              borderRadius: 14,
              border: `1px solid ${T.border}`,
              background: T.surface,
              boxShadow: '0 20px 70px rgba(0,0,0,0.45)',
              userSelect: 'text',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 id="legal-title" style={{ margin: 0, fontSize: 18 }}>
                  {isRTL ? 'الخصوصية وشروط الاستخدام' : 'Privacy & Terms'}
                </h2>
                <p style={{ margin: '6px 0 0', color: T.text2, fontSize: 12 }}>
                  {isRTL ? 'آخر تحديث: 1 أغسطس 2026' : 'Last updated: August 1, 2026'}
                </p>
              </div>
              <button
                type="button"
                aria-label={isRTL ? 'إغلاق' : 'Close'}
                onClick={() => setShowLegal(false)}
                style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', border: 0, borderRadius: 8, background: T.segmentedBg, color: T.text1, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: 20, fontSize: 13, lineHeight: 1.7, color: T.text1 }}>
              <h3 style={{ marginBottom: 6 }}>{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</h3>
              <p style={{ marginTop: 0 }}>
                {isRTL
                  ? 'يعالج KeyFixer النص بالكامل على جهازك. لا يجمع التطبيق النصوص أو يخزنها أو يرسلها إلى أي خادم، ولا يتضمن تحليلات أو إعلانات أو تتبعًا.'
                  : 'KeyFixer processes text entirely on your device. The app does not collect, store, or transmit your text and includes no analytics, advertising, or tracking.'}
              </p>
              <p>
                {isRTL
                  ? 'يكتب التطبيق النص المصحح إلى الحافظة فقط عندما تضغط زر النسخ، ولا يقرأ محتوى الحافظة. لا يتطلب التطبيق حسابًا ولا اتصالًا بالإنترنت.'
                  : 'The app writes corrected text to the clipboard only when you press Copy and does not read clipboard contents. No account or internet connection is required.'}
              </p>

              <h3 style={{ marginBottom: 6 }}>{isRTL ? 'شروط الاستخدام' : 'Terms of Use'}</h3>
              <p style={{ marginTop: 0 }}>
                {isRTL
                  ? 'تُقدّم الأداة كما هي للمساعدة في تصحيح تخطيط لوحة المفاتيح. أنت مسؤول عن مراجعة النص الناتج قبل استخدامه. لا يجوز إساءة استخدام التطبيق أو محاولة تعطيله أو إعادة توزيعه بما يخالف ترخيصه.'
                  : 'The utility is provided as-is to help correct keyboard-layout text. You are responsible for reviewing converted text before use. You may not misuse, disrupt, or redistribute the app contrary to its license.'}
              </p>
              <p style={{ marginBottom: 0, color: T.text2 }}>
                {isRTL ? 'للدعم أو طلبات الخصوصية، تواصل معنا عبر: ' : 'For support or privacy requests, contact us at: '}
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: T.accent, overflowWrap: 'anywhere' }}
                >
                  {SUPPORT_URL}
                </a>
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 20 }}
      >
        
        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Conversion Mode Segmented Control */}
          <div style={{
            display: 'flex',
            background: T.segmentedBg,
            border: `1px solid ${T.border}`,
            padding: 2,
            borderRadius: 8,
          }}>
            {(['auto', 'en2ar', 'ar2en'] as ConversionMode[]).map((m) => {
              const label = m === 'auto' ? t.autoMode : m === 'en2ar' ? t.enToArMode : t.arToEnMode;
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    color: active ? T.text1 : T.text2,
                    background: active ? T.surface : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Split View */}
        <div style={{ flex: 1, display: 'flex', gap: 20, minHeight: 0 }}>
          
          {/* INPUT AREA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isRTL ? 'النص الأصلي' : 'Input'}
              </span>
              <button
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
                fontFamily: FONT_MONO,
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                color: T.text1,
                resize: 'none',
                outline: 'none',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e => (e.target.style.borderColor = T.border)}
            />
          </div>

          {/* OUTPUT AREA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isRTL ? 'النتيجة' : 'Output'}
              </span>
              <span style={{ fontSize: 11, color: T.text2, fontFamily: FONT_MONO }}>
                {output ? `${output.length} ${t.chars}` : ''}
              </span>
            </div>
            <div
              dir="auto"
              style={{
                flex: 1,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: FONT_MONO,
                background: output ? T.accentDim : T.inputBg,
                border: `1px solid ${output ? T.accent : T.border}`,
                borderRadius: 10,
                color: output ? T.text1 : T.text2,
                overflowY: 'auto',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)',
                userSelect: 'text',
              }}
            >
              {output || t.outputPlaceholder}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
          {/* Developer Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.text2, opacity: 0.6, letterSpacing: '0.02em', userSelect: 'none' }}>
            <span>KeyFixer v{appVersion}</span>
            <span>&bull;</span>
            <span title="Global shortcut">⌥⌘K</span>
            <span>&bull;</span>
            <span>By Obada Dallo</span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setShowLegal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
            >
              <ShieldCheck size={12} /> {isRTL ? 'الخصوصية والشروط' : 'Privacy & Terms'}
            </button>
          </div>

          <button
            onClick={doCopy}
            disabled={!output}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 600,
              color: copied ? '#FFFFFF' : T.btnText,
              background: copied ? '#34C759' : output ? T.accent : T.surface,
              border: 'none',
              borderRadius: 8,
              cursor: output ? 'pointer' : 'not-allowed',
              opacity: output ? 1 : 0.5,
              transition: 'all 0.2s',
              boxShadow: output ? '0 2px 8px rgba(245,158,11,0.25)' : 'none',
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
