/**
 * @file DownloadSection.tsx
 * @description Sleek, minimal, non-intrusive download badges for macOS, Windows, and Chrome Extension.
 */

import React from 'react';
import { UILanguage } from '../types';
import { Download, Chrome, Monitor, Apple, ExternalLink } from 'lucide-react';

interface DownloadSectionProps {
  lang: UILanguage;
}

// ─── CONFIGURE RELEASE LINKS HERE ──────────────────────────────────────────
const DOWNLOAD_LINKS = {
  mac:       '', // e.g. 'https://github.com/obadadallo95/keyfixer/releases/latest/download/KeyFixer.dmg'
  windows:   '', // e.g. 'https://github.com/obadadallo95/keyfixer/releases/latest/download/KeyFixer-Setup.exe'
  chrome:    '', // e.g. 'https://chromewebstore.google.com/detail/keyfixer/...'
};
// ─────────────────────────────────────────────────────────────────────────────

const i18n = {
  en: {
    getApps: 'Apps & Extension:',
    mac: 'macOS',
    windows: 'Windows',
    chrome: 'Chrome Extension',
    comingSoon: 'Soon',
  },
  ar: {
    getApps: 'التطبيقات والإضافة:',
    mac: 'ماك macOS',
    windows: 'ويندوز',
    chrome: 'إضافة كروم',
    comingSoon: 'قريباً',
  },
};

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const t = i18n[lang];

  const items = [
    {
      key: 'mac',
      icon: <Apple className="w-3.5 h-3.5" />,
      label: t.mac,
      url: DOWNLOAD_LINKS.mac,
    },
    {
      key: 'windows',
      icon: <Monitor className="w-3.5 h-3.5" />,
      label: t.windows,
      url: DOWNLOAD_LINKS.windows,
    },
    {
      key: 'chrome',
      icon: <Chrome className="w-3.5 h-3.5 text-amber-400" />,
      label: t.chrome,
      url: DOWNLOAD_LINKS.chrome,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 pt-3 border-t border-white/[0.06] relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
      <span className="text-slate-500 font-medium flex items-center gap-1.5 me-1">
        <Download className="w-3.5 h-3.5 text-slate-400" />
        <span>{t.getApps}</span>
      </span>

      {items.map((item) => {
        const isAvailable = Boolean(item.url);
        return isAvailable ? (
          <a
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 font-medium transition-all shadow-sm group"
          >
            {item.icon}
            <span>{item.label}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <span
            key={item.key}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-slate-500 font-normal select-none"
          >
            {item.icon}
            <span>{item.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-500/80 font-mono">
              {t.comingSoon}
            </span>
          </span>
        );
      })}
    </div>
  );
};
