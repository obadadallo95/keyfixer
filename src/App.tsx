/**
 * @file App.tsx
 * @description Main Web Application and Landing Page for KeyFixer.
 */

import React, { useState, useEffect } from 'react';
import { UILanguage, DEVELOPER_PROFILE } from './types';
import { ConverterArea } from './components/ConverterArea';
import { DownloadSection, DOWNLOAD_LINKS } from './components/DownloadSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DeveloperCredit } from './components/DeveloperCredit';
import { translations } from './i18n/translations';
import {
  AppWindow,
  Coffee,
  Sparkles,
  ArrowRight,
  Apple,
  Monitor,
  Github,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

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

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('keyfixer_lang', lang);
  }, [lang]);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050505] text-slate-200 font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* Immersive Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[450px] sm:w-[650px] h-[350px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] sm:w-[550px] h-[300px] sm:h-[450px] bg-blue-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[400px] sm:w-[500px] h-[300px] sm:h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Announcement Banner for Mac App Store & Microsoft Store */}
      <div className="w-full bg-gradient-to-r from-amber-500/20 via-white/10 to-amber-500/20 border-b border-amber-500/30 py-2.5 px-4 text-center relative z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
            {t.announcement.badge}
          </span>
          <span className="text-white font-medium">
            {t.announcement.text}
          </span>
          <a
            href={DOWNLOAD_LINKS.macAppStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 decoration-amber-400/50 hover:decoration-amber-300 transition-colors"
          >
            <Apple className="w-3.5 h-3.5" />
            <span>{t.announcement.action}</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.svg"
              alt="KeyFixer Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none flex items-center gap-1.5">
                KeyFixer
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-400 font-bold">v1.3</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden md:inline leading-tight mt-0.5">
                {t.tagline}
              </span>
            </div>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#converter" className="hover:text-amber-400 transition-colors">
              {t.nav.converter}
            </a>
            <a href="#download" className="hover:text-amber-400 transition-colors">
              {t.nav.download}
            </a>
            <a href="#features" className="hover:text-amber-400 transition-colors">
              {t.nav.features}
            </a>
            <a href="#shortcuts" className="hover:text-amber-400 transition-colors">
              {t.nav.shortcuts}
            </a>
            <a href="/about" className="hover:text-amber-400 transition-colors">
              {t.nav.about}
            </a>
          </nav>

          {/* Right Controls: Desktop collapse & Language switcher */}
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
              </button>
            )}

            {/* Language Switcher Switch */}
            <button
              dir="ltr"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="relative flex items-center p-0.5 rounded-full bg-black/50 border border-white/15 hover:border-white/30 transition-all shadow-inner group"
              title="Toggle Language"
            >
              <div
                className={`absolute h-[28px] w-[54px] bg-amber-500 rounded-full transition-transform duration-300 ease-out shadow-md ${
                  lang === 'en' ? 'translate-x-0' : 'translate-x-[54px]'
                }`}
              />
              <div
                className={`relative z-10 flex items-center justify-center h-[28px] w-[54px] text-[11px] font-extrabold tracking-wider transition-colors duration-300 ${
                  lang === 'en' ? 'text-black' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                EN
              </div>
              <div
                className={`relative z-10 flex items-center justify-center h-[28px] w-[54px] text-[11px] font-extrabold tracking-wider transition-colors duration-300 ${
                  lang === 'ar' ? 'text-black' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                عربي
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 flex flex-col items-center gap-12">
        
        {/* Hero Presentation Header */}
        <section className="text-center flex flex-col items-center gap-4 max-w-3xl">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-slate-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{' '}
            {t.hero.titleEnd}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            {t.hero.sub}
          </p>

          {/* Quick CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={DOWNLOAD_LINKS.macAppStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <Apple className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل للماك (Mac App Store)' : 'Get for Mac (App Store)'}</span>
            </a>

            <a
              href={DOWNLOAD_LINKS.microsoftStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0078D4] hover:bg-[#0078D4]/90 text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-[0_0_25px_rgba(0,120,212,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل للويندوز (MS Store)' : 'Get for Windows'}</span>
            </a>

            <a
              href="#converter"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all hover:scale-105"
            >
              <span>{t.hero.openWebConverter}</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

        </section>

        {/* Live Interactive Converter Tool */}
        <ConverterArea lang={lang} isDesktop={isDesktop} />

        {/* Official Store Downloads Section */}
        <DownloadSection lang={lang} />

        {/* Features & Shortcuts Guide */}
        <FeaturesSection lang={lang} />

        {/* Developer Credit & Legal Links */}
        <DeveloperCredit lang={lang} />

      </main>

      {/* Floating Support Coffee Button */}
      <a
        href={DEVELOPER_PROFILE.donation}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 transition-all group"
        title={lang === 'ar' ? 'ادعم المشروع ☕' : 'Support Project ☕'}
      >
        <Coffee className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="text-xs sm:text-sm hidden sm:inline-block">{lang === 'ar' ? 'ادعم المشروع' : 'Support'}</span>
      </a>

      <Analytics />
    </div>
  );
}
