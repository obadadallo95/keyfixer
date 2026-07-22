/**
 * @file App.tsx
 * @description Main Application Entry Point for KeyFixer. Very simple minimalist dark/amber design.
 */

import React, { useState, useEffect } from 'react';
import { UILanguage } from './types';
import { ConverterArea } from './components/ConverterArea';
import { DeveloperCredit } from './components/DeveloperCredit';
import { translations } from './i18n/translations';
import { Globe, Keyboard } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<UILanguage>('en');

  // Enforce dark mode and document direction
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Immersive Background Radial Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Simple Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              {t.appName}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-colors text-white"
        >
          <Globe className="w-4 h-4 text-amber-500" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        <ConverterArea lang={lang} />
        <DeveloperCredit lang={lang} />
      </main>
    </div>
  );
}
