/**
 * @file DownloadSection.tsx
 * @description Download buttons for macOS, Windows, and Chrome Extension.
 * Shows "Coming Soon" badges until real release URLs are provided.
 */

import React from 'react';
import { UILanguage } from '../types';
import { Download, Chrome, Monitor, Apple, ExternalLink, Clock } from 'lucide-react';

interface DownloadSectionProps {
  lang: UILanguage;
}

// ─── CONFIGURE YOUR RELEASE LINKS HERE ───────────────────────────────────────
const DOWNLOAD_LINKS = {
  mac:       '', // e.g. 'https://github.com/obadadallo95/keyfixer/releases/latest/download/KeyFixer.dmg'
  windows:   '', // e.g. 'https://github.com/obadadallo95/keyfixer/releases/latest/download/KeyFixer-Setup.exe'
  chrome:    '', // e.g. 'https://chromewebstore.google.com/detail/keyfixer/...'
};
// ─────────────────────────────────────────────────────────────────────────────

const i18n = {
  en: {
    heading: 'Available On Every Platform',
    sub: 'Use KeyFixer wherever you work — browser, desktop, or on the web.',
    mac: { label: 'macOS App', hint: 'Apple Silicon & Intel · macOS 13+' },
    windows: { label: 'Windows App', hint: 'Windows 10 & 11 · 64-bit' },
    chrome: { label: 'Chrome Extension', hint: 'Chrome, Edge & Brave' },
    download: 'Download',
    comingSoon: 'Coming Soon',
    useWeb: 'Or use the free web version — no install needed ↑',
  },
  ar: {
    heading: 'متاح على كل المنصات',
    sub: 'استخدم KeyFixer أينما تعمل — المتصفح، سطح المكتب، أو الويب.',
    mac: { label: 'تطبيق macOS', hint: 'Apple Silicon وIntel · macOS 13+' },
    windows: { label: 'تطبيق Windows', hint: 'ويندوز 10 و11 · 64-bit' },
    chrome: { label: 'إضافة Chrome', hint: 'Chrome وEdge وBrave' },
    download: 'تحميل',
    comingSoon: 'قريباً',
    useWeb: 'أو استخدم النسخة المجانية على الويب — بدون تثبيت ↑',
  },
};

interface PlatformCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  hint: string;
  url: string;
  downloadLabel: string;
  comingSoonLabel: string;
}

function PlatformCard({ icon, iconBg, label, hint, url, downloadLabel, comingSoonLabel }: PlatformCardProps) {
  const isAvailable = Boolean(url);

  return (
    <div className={`
      group relative flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300
      ${isAvailable
        ? 'bg-white/[0.04] border-white/[0.08] hover:border-amber-500/30 hover:bg-white/[0.06] cursor-pointer'
        : 'bg-white/[0.02] border-white/[0.05]'
      }
    `}>
      {/* Platform icon */}
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{hint}</p>
      </div>

      {/* Button */}
      {isAvailable ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md hover:shadow-amber-500/25 hover:scale-105"
        >
          <Download className="w-3.5 h-3.5" />
          {downloadLabel}
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      ) : (
        <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-xs font-semibold select-none">
          <Clock className="w-3.5 h-3.5" />
          {comingSoonLabel}
        </div>
      )}
    </div>
  );
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ lang }) => {
  const t = i18n[lang];

  const platforms = [
    {
      key: 'mac',
      icon: <Apple className="w-7 h-7 text-white" />,
      iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900',
      label: t.mac.label,
      hint: t.mac.hint,
      url: DOWNLOAD_LINKS.mac,
    },
    {
      key: 'windows',
      icon: <Monitor className="w-7 h-7 text-[#0078D4]" />,
      iconBg: 'bg-gradient-to-br from-[#0078D4]/20 to-[#0078D4]/5',
      label: t.windows.label,
      hint: t.windows.hint,
      url: DOWNLOAD_LINKS.windows,
    },
    {
      key: 'chrome',
      icon: <Chrome className="w-7 h-7 text-amber-400" />,
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
      label: t.chrome.label,
      hint: t.chrome.hint,
      url: DOWNLOAD_LINKS.chrome,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 mb-2 relative z-10">
      {/* Section divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'التحميل' : 'Downloads'}</span>
        </div>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-white font-bold text-lg">{t.heading}</h2>
        <p className="text-slate-500 text-sm mt-1">{t.sub}</p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-2">
        {platforms.map((p) => (
          <PlatformCard
            key={p.key}
            icon={p.icon}
            iconBg={p.iconBg}
            label={p.label}
            hint={p.hint}
            url={p.url}
            downloadLabel={t.download}
            comingSoonLabel={t.comingSoon}
          />
        ))}
      </div>

      {/* Web version note */}
      <p className="text-center text-slate-600 text-xs mt-5">{t.useWeb}</p>
    </div>
  );
};
