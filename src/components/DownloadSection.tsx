/**
 * @file DownloadSection.tsx
 * @description Sleek, modern download section with official store badges for Microsoft Store, Chrome Web Store, and macOS.
 */

import React from 'react';
import { UILanguage } from '../types';
import { Chrome, Monitor, Apple, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface DownloadSectionProps {
  lang: UILanguage;
}

// ─── OFFICIAL STORE & RELEASE LINKS ──────────────────────────────────────────
export const DOWNLOAD_LINKS = {
  microsoftStore: 'https://apps.microsoft.com/detail/9pk3g83gp41d?ocid=webpdpshare',
  chromeWebStore: 'https://chromewebstore.google.com/detail/bgleifjaplnanbncododdkgkpaieeafg?utm_source=item-share-cb',
  macReleases: 'https://github.com/obadadallo95/keyfixer/releases',
};
// ─────────────────────────────────────────────────────────────────────────────

const i18n = {
  en: {
    sectionBadge: 'Available Everywhere',
    sectionTitle: 'Install KeyFixer on Your Devices',
    sectionSub: 'Native performance, instant background shortcuts, and zero tracking.',
    msStoreTitle: 'Microsoft Store',
    msStoreSub: 'For Windows 10 & 11',
    msStoreBadge: 'Verified',
    chromeTitle: 'Chrome Web Store',
    chromeSub: 'Extension for Chromium',
    chromeBadge: 'Free Add-on',
    macTitle: 'macOS Desktop',
    macSub: 'Apple Silicon & Intel',
    macBadge: 'In Review',
    directDownload: 'GitHub Releases',
    offlineNotice: '100% Offline • Zero Data Collection',
  },
  ar: {
    sectionBadge: 'متاح على جميع منصاتك',
    sectionTitle: 'حمّل KeyFixer على أجهزتك',
    sectionSub: 'أداء فائق، اختصارات سريعة في الخلفية، وبدون أي تتبع نهائياً.',
    msStoreTitle: 'Microsoft Store',
    msStoreSub: 'لويندوز 10 و 11',
    msStoreBadge: 'رسمي وموثق',
    chromeTitle: 'سوق Chrome الإلكتروني',
    chromeSub: 'إضافة لمتصفحات كروم',
    chromeBadge: 'إضافة مجانية',
    macTitle: 'تطبيق macOS',
    macSub: 'معالجات Apple و Intel',
    macBadge: 'قيد المراجعة',
    directDownload: 'إصدارات GitHub',
    offlineNotice: 'يعمل محلياً 100% • بدون جمع أي بيانات',
  },
};

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const t = i18n[lang];
  const isRTL = lang === 'ar';

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 pt-8 border-t border-white/[0.08] relative z-10 flex flex-col items-center gap-6">
      
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold tracking-wide uppercase">
          <Sparkles className="w-3 h-3" />
          <span>{t.sectionBadge}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {t.sectionTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
          {t.sectionSub}
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
        
        {/* 1. Microsoft Store (Live) */}
        <a
          href={DOWNLOAD_LINKS.microsoftStore}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-[#0078D4]/10 to-white/[0.02] border border-[#0078D4]/30 hover:border-[#0078D4]/70 hover:bg-[#0078D4]/15 transition-all duration-300 shadow-lg hover:shadow-[#0078D4]/10 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-[#0078D4]/20 border border-[#0078D4]/30 text-[#38BDF8] group-hover:scale-110 group-hover:bg-[#0078D4]/30 transition-all">
              <Monitor className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0078D4]/20 border border-[#0078D4]/40 text-[#38BDF8]">
              {t.msStoreBadge}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                {t.msStoreTitle}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all" />
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {t.msStoreSub}
            </p>
          </div>
        </a>

        {/* 2. Chrome Web Store (Live) */}
        <a
          href={DOWNLOAD_LINKS.chromeWebStore}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-white/[0.02] border border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-500/15 transition-all duration-300 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/30 transition-all">
              <Chrome className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
              {t.chromeBadge}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                {t.chromeTitle}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all" />
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {t.chromeSub}
            </p>
          </div>
        </a>

        {/* 3. macOS App */}
        <a
          href={DOWNLOAD_LINKS.macReleases}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-b from-slate-500/10 to-white/[0.02] border border-white/15 hover:border-white/40 hover:bg-white/[0.06] transition-all duration-300 shadow-lg hover:-translate-y-0.5 overflow-hidden"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-slate-200 group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-300">
              {t.macBadge}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                {t.macTitle}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-60 group-hover:opacity-100 transition-all" />
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {t.macSub}
            </p>
          </div>
        </a>

      </div>

      {/* Trust & Privacy Note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{t.offlineNotice}</span>
      </div>

    </div>
  );
};
