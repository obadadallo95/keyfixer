/**
 * @file DeveloperCredit.tsx
 * @description A clean, professional, and elegant developer profile card.
 */

import React from 'react';
import { UILanguage, DEVELOPER_PROFILE } from '../types';
import { translations } from '../i18n/translations';
import { Github, Linkedin, Globe, Code2, Coffee, Heart, Shield, FileText } from 'lucide-react';

interface DeveloperCreditProps {
  lang: UILanguage;
}

export const DeveloperCredit: React.FC<DeveloperCreditProps> = ({ lang }) => {
  const isRTL = lang === 'ar';

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 flex flex-col gap-3 text-xs font-medium text-slate-500/70 relative z-10 px-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-5 pb-2 border-t border-white/[0.04] mt-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px]">
          <a
            href="/privacy"
            className="hover:text-slate-300 transition-colors"
          >
            {isRTL ? 'الخصوصية' : 'Privacy'}
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/terms"
            className="hover:text-slate-300 transition-colors"
          >
            {isRTL ? 'الشروط' : 'Terms'}
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/refund"
            className="hover:text-slate-300 transition-colors"
          >
            {isRTL ? 'الشراء والاسترجاع' : 'Purchase & Refund'}
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/impressum"
            className="hover:text-slate-300 transition-colors"
          >
            {isRTL ? 'المعلومات القانونية' : 'Impressum'}
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/about"
            className="hover:text-amber-400 transition-colors"
          >
            {isRTL ? 'عن المطور' : 'About Developer'}
          </a>
        </div>
        
        <div className="flex items-center gap-3 text-slate-600 text-[11.5px]">
          <span>© {new Date().getFullYear()} KeyFixer</span>
          <span>·</span>
          <span>By Obada Dallo</span>
        </div>
      </div>
    </div>
  );
};


