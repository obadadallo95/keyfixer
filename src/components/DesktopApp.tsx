import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { convertKeyboardLayout } from '../core/keyboard';
import { ConversionMode } from '../core/keyboard/types';
import { translations } from '../i18n/translations';
import { UILanguage } from '../types';
import { Copy, Check, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

const FONT_SYS = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"SF Mono", ui-monospace, Menlo, monospace';

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
          <div style={{ fontSize: 11, color: T.text2, opacity: 0.6, letterSpacing: '0.02em', userSelect: 'none' }}>
            KeyFixer v1.0.0 &bull;{' '}
            <span
              onClick={() => invoke('plugin:shell|open', { path: 'https://obadadallo.web.app/' }).catch(console.error)}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = T.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = T.text2;
              }}
              title="Visit Portfolio"
            >
              By Obada Dallo
            </span>
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
