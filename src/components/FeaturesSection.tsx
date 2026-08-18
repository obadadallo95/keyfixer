/**
 * @file FeaturesSection.tsx
 * @description Features showcase and global shortcuts guide for KeyFixer.
 */

import React from 'react';
import { UILanguage } from '../types';
import { translations } from '../i18n/translations';
import { Zap, ShieldCheck, Keyboard, Cpu, Command, Sparkles, Check, ArrowRight } from 'lucide-react';

interface FeaturesSectionProps {
  lang: UILanguage;
}

const FEATURE_ICONS = [
  <Zap className="w-5 h-5 text-amber-400" />,
  <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  <Keyboard className="w-5 h-5 text-sky-400" />,
  <Cpu className="w-5 h-5 text-purple-400" />,
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ lang }) => {
  const t = translations[lang].features;
  const shortcutsT = translations[lang].shortcutsSection;
  const isRTL = lang === 'ar';

  return (
    <section id="features" className="w-full max-w-5xl mx-auto mt-20 pt-12 border-t border-white/[0.08] relative z-10 flex flex-col items-center gap-12">
      
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

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {t.items.map((item, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 shadow-lg hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                {FEATURE_ICONS[idx % FEATURE_ICONS.length]}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Global Shortcuts Showcase Box */}
      <div id="shortcuts" className="w-full rounded-3xl bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-transparent border border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-lg text-center lg:text-left">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
              {shortcutsT.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {shortcutsT.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {shortcutsT.sub}
            </p>
          </div>

          {/* Shortcut Keys Display */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            {/* macOS Shortcut */}
            <div className="flex-1 sm:flex-none flex flex-col items-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/15 shadow-inner">
              <span className="text-[11px] font-medium text-slate-400">{shortcutsT.macStep}</span>
              <kbd className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-amber-300 font-mono text-sm font-bold shadow-md tracking-wide flex items-center gap-1.5">
                <Command className="w-4 h-4 text-amber-400" />
                <span>{shortcutsT.macKey}</span>
              </kbd>
            </div>

            {/* Windows Shortcut */}
            <div className="flex-1 sm:flex-none flex flex-col items-center gap-2 p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/15 shadow-inner">
              <span className="text-[11px] font-medium text-slate-400">{shortcutsT.winStep}</span>
              <kbd className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-sky-300 font-mono text-sm font-bold shadow-md tracking-wide flex items-center gap-1.5">
                <span>{shortcutsT.winKey}</span>
              </kbd>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-center gap-2 text-xs text-amber-400/90 font-medium">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span>{shortcutsT.note}</span>
        </div>
      </div>

    </section>
  );
};
