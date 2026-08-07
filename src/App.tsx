/**
 * @file App.tsx
 * @description Main Application Entry Point for KeyFixer. Very simple minimalist dark/amber design.
 */

import React, { useState, useEffect } from 'react';
import { UILanguage } from './types';
import { ConverterArea } from './components/ConverterArea';
import { DeveloperCredit } from './components/DeveloperCredit';
import { DownloadSection } from './components/DownloadSection';
import { openFloatingKeyFixerWindow, isDocumentPipSupported } from './components/FloatingKeyFixer';
import { translations } from './i18n/translations';
import { AppWindow, Coffee } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { DEVELOPER_PROFILE } from './types';

export default function App({
  isDesktop = false,
  onCollapse,
}: {
  isDesktop?: boolean;
  onCollapse?: () => void;
} = {}) {
  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });
  const [pipSupported, setPipSupported] = useState<boolean>(false);

  // Enforce dark mode, document direction, and PiP support check
  useEffect(() => {
    document.documentElement.classList.add('dark');
    setPipSupported(isDocumentPipSupported());
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('keyfixer_lang', lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <div data-tauri-drag-region className="min-h-[100dvh] flex flex-col bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Immersive Background Radial Ambient Glows */}
      <div data-tauri-drag-region className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div data-tauri-drag-region className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Simple Header */}
      <header data-tauri-drag-region className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between cursor-default">
        <div data-tauri-drag-region className="flex items-center gap-3 sm:gap-4">
          <img src="/logo.svg" alt="KeyFixer Logo" className="h-8 sm:h-11 w-auto object-contain" />
          <div className="hidden sm:flex flex-col justify-center gap-0.5">
            <p className="text-[13px] text-slate-300 font-medium leading-none">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDesktop && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all shadow-sm group"
              title={lang === 'ar' ? 'طي' : 'Collapse'}
            >
              <AppWindow className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'طي النافذة' : 'Collapse Window'}</span>
              <span className="sm:hidden">{lang === 'ar' ? 'طي' : 'Collapse'}</span>
            </button>
          )}

          <button
            dir="ltr"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="relative flex items-center p-1 rounded-full bg-black/40 border border-white/10 hover:border-white/20 transition-all shadow-inner group"
            title="Toggle Language"
          >
            <div
              className={`absolute h-[32px] w-[64px] bg-amber-500 rounded-full transition-transform duration-300 ease-out shadow-md ${
                lang === 'en' ? 'translate-x-0' : 'translate-x-[64px]'
              }`}
            />
            <div
              className={`relative z-10 flex items-center justify-center h-[32px] w-[64px] text-[12px] font-bold tracking-widest transition-colors duration-300 ${
                lang === 'en' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              EN
            </div>
            <div
              className={`relative z-10 flex items-center justify-center h-[32px] w-[64px] text-[12px] font-bold tracking-wider transition-colors duration-300 ${
                lang === 'ar' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              عربي
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 pb-4 sm:py-6 flex flex-col min-h-0">
        <ConverterArea lang={lang} isDesktop={isDesktop} />
        <DownloadSection lang={lang} />
        <DeveloperCredit lang={lang} />
      </main>

      {/* Floating Support Button */}
      <a
        href={DEVELOPER_PROFILE.donation}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-2.5 py-2.5 sm:px-3 sm:py-2.5 bg-amber-500/90 hover:bg-amber-500 text-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
        title={lang === 'ar' ? 'ادعم المشروع' : 'Support Project'}
      >
        <Coffee className="w-4 h-4 sm:w-4 sm:h-4" />
        <span className="font-semibold text-sm hidden sm:inline-block">{lang === 'ar' ? 'ادعم المشروع' : 'Support'}</span>
      </a>

      <Analytics />
    </div>
  );
}
