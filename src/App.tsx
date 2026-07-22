/**
 * @file App.tsx
 * @description Main Application Entry Point for KeyFixer. Very simple minimalist dark/amber design.
 */

import React, { useState, useEffect } from 'react';
import { UILanguage } from './types';
import { ConverterArea } from './components/ConverterArea';
import { DeveloperCredit } from './components/DeveloperCredit';
import { openFloatingKeyFixerWindow } from './components/FloatingKeyFixer';
import { translations } from './i18n/translations';
import { Globe, AppWindow } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  // Enforce dark mode and document direction
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('keyfixer_lang', lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Immersive Background Radial Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Simple Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.svg" alt="KeyFixer Logo" className="h-8 sm:h-12 w-auto object-contain" />
          <div className="hidden sm:block">
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openFloatingKeyFixerWindow(lang)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all shadow-sm group"
            title={t.converter.openFloating}
          >
            <AppWindow className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t.converter.openFloating}</span>
            <span className="sm:hidden">{lang === 'ar' ? 'عائم' : 'Floating'}</span>
          </button>

          <button
            dir="ltr"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="relative flex items-center p-1 rounded-full bg-black/40 border border-white/10 hover:border-white/20 transition-all shadow-inner group"
            title="Toggle Language"
          >
            <div
              className={`absolute h-[28px] w-[64px] bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-full transition-transform duration-300 ease-out ${
                lang === 'en' ? 'translate-x-0' : 'translate-x-[64px]'
              }`}
            />
            <div
              className={`relative z-10 flex items-center justify-center h-[28px] w-[64px] text-[11px] font-black tracking-widest transition-colors duration-300 ${
                lang === 'en' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 group-hover:text-slate-400'
              }`}
            >
              EN
            </div>
            <div
              className={`relative z-10 flex items-center justify-center h-[28px] w-[64px] text-[11px] font-black tracking-wider transition-colors duration-300 ${
                lang === 'ar' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-500 group-hover:text-slate-400'
              }`}
            >
              عربي
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 pb-4 sm:py-8 flex flex-col min-h-0">
        <ConverterArea lang={lang} />
        <DeveloperCredit lang={lang} />
      </main>
      <Analytics />
    </div>
  );
}
