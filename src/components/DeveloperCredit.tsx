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
      {/* Developer links row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 transition-colors hover:text-slate-400">
          <Code2 className="w-3.5 h-3.5" />
          <span>{t.builtBy}</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href={DEVELOPER_PROFILE.portfolio}
            target="_blank"
            rel="me noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الموقع' : 'Website'}</span>
          </a>
          <a
            href={DEVELOPER_PROFILE.github}
            target="_blank"
            rel="me noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href={DEVELOPER_PROFILE.githubSponsors}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-pink-500 hover:text-pink-400 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-500" />
            <span>{lang === 'ar' ? 'رعاية' : 'Sponsor'}</span>
          </a>
          <a
            href={DEVELOPER_PROFILE.linkedin}
            target="_blank"
            rel="me noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
          <a
            href={DEVELOPER_PROFILE.donation}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-amber-500/90 hover:text-amber-400 transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'ادعم المشروع' : 'Support'}</span>
          </a>
        </div>
      </div>

      {/* Legal links row — subtle separator */}
      <div className="flex items-center justify-center gap-4 pt-1 border-t border-white/[0.04]">
        <a
          href="/privacy"
          className="flex items-center gap-1 hover:text-slate-400 transition-colors"
        >
          <Shield className="w-3 h-3" />
          <span>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
        </a>
        <span className="text-slate-700">·</span>
        <a
          href="/terms"
          className="flex items-center gap-1 hover:text-slate-400 transition-colors"
        >
          <FileText className="w-3 h-3" />
          <span>{lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</span>
        </a>
        <span className="text-slate-700">·</span>
        <span className="text-slate-700">© {new Date().getFullYear()} KeyFixer</span>
      </div>
    </div>
  );
};


