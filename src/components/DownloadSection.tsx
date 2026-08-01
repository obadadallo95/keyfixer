/**
 * @file DownloadSection.tsx
 * @description Sleek, minimal download section emphasizing the macOS App Store release.
 */

import React from 'react';
import { UILanguage } from '../types';
import { Download, Chrome, Monitor, Apple, ExternalLink } from 'lucide-react';

interface DownloadSectionProps {
  lang: UILanguage;
}

// ─── CONFIGURE RELEASE LINKS HERE ──────────────────────────────────────────
const DOWNLOAD_LINKS = {
  mac:       '', // e.g. 'https://apps.apple.com/us/app/keyfixer/...'
  windows:   '', // e.g. 'https://github.com/obadadallo95/keyfixer/releases/latest/download/KeyFixer-Setup.exe'
  chrome:    '', // e.g. 'https://chromewebstore.google.com/detail/keyfixer/...'
};
// ─────────────────────────────────────────────────────────────────────────────

const i18n = {
  en: {
    macLabel: 'Mac App Store',
    macSub: 'Free',
    windows: 'Windows',
    chrome: 'Chrome',
    comingSoon: 'Soon',
    soonOnMac: 'Soon on Mac App Store',
  },
  ar: {
    macLabel: 'Mac App Store',
    macSub: 'مجاني',
    windows: 'ويندوز',
    chrome: 'إضافة كروم',
    comingSoon: 'قريباً',
    soonOnMac: 'قريباً على Mac App Store',
  },
};

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const t = i18n[lang];

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 pt-6 border-t border-white/[0.06] relative z-10 flex flex-col items-center gap-4">
      
      {/* Primary Call to Action: macOS */}
      <a
        href={DOWNLOAD_LINKS.mac || '#'}
        target={DOWNLOAD_LINKS.mac ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={`group relative flex items-center justify-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 shadow-xl overflow-hidden ${
          DOWNLOAD_LINKS.mac 
            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 hover:scale-105'
            : 'bg-white/10 text-white cursor-default'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <Apple className="w-6 h-6 relative z-10" />
        <div className="flex flex-col items-start relative z-10">
          {!DOWNLOAD_LINKS.mac ? (
            <span className="text-sm font-bold leading-tight tracking-wide">{t.soonOnMac}</span>
          ) : (
            <>
              <span className="text-sm font-bold leading-tight">{t.macLabel}</span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{t.macSub}</span>
            </>
          )}
        </div>
      </a>

      {/* Secondary Platforms */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
        {/* Windows */}
        {DOWNLOAD_LINKS.windows ? (
          <a
            href={DOWNLOAD_LINKS.windows}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-[#0078D4]/60 hover:bg-[#0078D4]/20 text-slate-200 hover:text-white font-semibold transition-all shadow-md group"
          >
            <Monitor className="w-4 h-4 text-[#0078D4]" />
            <span>{t.windows}</span>
            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 font-medium select-none shadow-sm">
            <Monitor className="w-4 h-4 opacity-50" />
            <span>{t.windows}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">{t.comingSoon}</span>
          </span>
        )}

        {/* Chrome Extension */}
        {DOWNLOAD_LINKS.chrome ? (
          <a
            href={DOWNLOAD_LINKS.chrome}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-amber-500/60 hover:bg-amber-500/20 text-slate-200 hover:text-white font-semibold transition-all shadow-md group"
          >
            <Chrome className="w-4 h-4 text-amber-500" />
            <span>{t.chrome}</span>
            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 font-medium select-none shadow-sm">
            <Chrome className="w-4 h-4 opacity-50" />
            <span>{t.chrome}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">{t.comingSoon}</span>
          </span>
        )}
      </div>

    </div>
  );
};
