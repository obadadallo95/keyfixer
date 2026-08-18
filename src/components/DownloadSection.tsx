/**
 * @file DownloadSection.tsx
 * @description Sleek, modern official store cards for Apple Mac App Store, Microsoft Store, Chrome Web Store, and GitHub Releases.
 */

import React from 'react';
import { UILanguage } from '../types';
import { translations } from '../i18n/translations';
import { Chrome, Monitor, Apple, Github, ExternalLink, ShieldCheck, Sparkles, CheckCircle2, Download } from 'lucide-react';

interface DownloadSectionProps {
  lang: UILanguage;
}

// ─── OFFICIAL STORE & RELEASE LINKS ──────────────────────────────────────────
export const DOWNLOAD_LINKS = {
  macAppStore: 'https://apps.apple.com/de/app/keyfixer/id6796866841?mt=12',
  microsoftStore: 'https://apps.microsoft.com/detail/9pk3g83gp41d?ocid=webpdpshare',
  chromeWebStore: 'https://chromewebstore.google.com/detail/bgleifjaplnanbncododdkgkpaieeafg?utm_source=item-share-cb',
  githubReleases: 'https://github.com/obadadallo95/keyfixer/releases',
};
// ─────────────────────────────────────────────────────────────────────────────

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const t = translations[lang].downloads;
  const isRTL = lang === 'ar';

  return (
    <section id="download" className="w-full max-w-5xl mx-auto mt-16 pt-12 border-t border-white/[0.08] relative z-10 flex flex-col items-center gap-8">
      
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.title}
        </h2>
        <p className="text-sm text-slate-400">
          {t.sub}
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        
        {/* 1. Apple Mac App Store (FEATURED & NEW) */}
        <a
          href={DOWNLOAD_LINKS.macAppStore}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/20 hover:border-amber-400/80 hover:bg-gradient-to-b hover:from-white/[0.12] hover:to-amber-500/[0.04] transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:-translate-y-1 overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all pointer-events-none" />

          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-md">
                <Apple className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                {t.macStoreBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t.macStoreTitle}
              </h3>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all shrink-0" />
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {t.macStoreSub}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1">
              {lang === 'ar' ? 'تحميل مجاناً من App Store' : 'Get on Mac App Store'}
              <span className={isRTL ? 'rotate-180 inline-block' : ''}>→</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">macOS 12+</span>
          </div>
        </a>

        {/* 2. Microsoft Store (Verified) */}
        <a
          href={DOWNLOAD_LINKS.microsoftStore}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0078D4]/10 to-white/[0.02] border border-[#0078D4]/30 hover:border-[#0078D4]/80 hover:bg-[#0078D4]/15 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(0,120,212,0.18)] hover:-translate-y-1 overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#0078D4]/15 rounded-full blur-2xl group-hover:bg-[#0078D4]/25 transition-all pointer-events-none" />

          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#0078D4]/20 border border-[#0078D4]/30 text-[#38BDF8] group-hover:scale-110 group-hover:bg-[#0078D4]/30 transition-all shadow-md">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0078D4]/20 border border-[#0078D4]/40 text-[#38BDF8] shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                {t.msStoreBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                {t.msStoreTitle}
              </h3>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all shrink-0" />
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {t.msStoreSub}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#38BDF8] group-hover:underline flex items-center gap-1">
              {lang === 'ar' ? 'تحميل من Microsoft Store' : 'Get on Microsoft Store'}
              <span className={isRTL ? 'rotate-180 inline-block' : ''}>→</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Win 10/11</span>
          </div>
        </a>

        {/* 3. Chrome Web Store */}
        <a
          href={DOWNLOAD_LINKS.chromeWebStore}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 to-white/[0.02] border border-amber-500/30 hover:border-amber-500/80 hover:bg-amber-500/15 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:-translate-y-1 overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all pointer-events-none" />

          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all shadow-md">
                <Chrome className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm">
                {t.chromeBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                {t.chromeTitle}
              </h3>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all shrink-0" />
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {t.chromeSub}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1">
              {lang === 'ar' ? 'إضافة إلى Chrome مجاناً' : 'Add to Chrome Free'}
              <span className={isRTL ? 'rotate-180 inline-block' : ''}>→</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Manifest V3</span>
          </div>
        </a>

      </div>

      {/* GitHub Releases and Direct Installers Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all gap-3 sm:gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {t.directTitle}
            </h4>
            <p className="text-xs text-slate-400">
              {t.directSub}
            </p>
          </div>
        </div>

        <a
          href={DOWNLOAD_LINKS.githubReleases}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all hover:scale-105 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تحميل ملفات التثبيت (Direct PKG/EXE)' : 'View GitHub Releases'}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>

      {/* Trust & Privacy Note */}
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t.offlineNotice}</span>
      </div>

    </section>
  );
};
