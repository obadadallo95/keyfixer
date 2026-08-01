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
  const t = translations[lang].developer;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 flex flex-col gap-3 text-xs font-medium text-slate-500/70 relative z-10 px-2">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-5 pb-2 border-t border-white/[0.04] mt-2">
        <div className="flex items-center gap-4">
          <a
            href="/about"
            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'عن المطور' : 'About Developer'}</span>
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/privacy"
            className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="/terms"
            className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</span>
          </a>
        </div>
        
        <div className="flex items-center gap-4 text-slate-600">
          <span className="hidden sm:block text-slate-700">|</span>
          <span>© {new Date().getFullYear()} KeyFixer</span>
        </div>
      </div>
    </div>
  );
};


