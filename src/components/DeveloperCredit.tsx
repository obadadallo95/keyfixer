/**
 * @file DeveloperCredit.tsx
 * @description A clean, professional, and elegant developer profile card.
 */

import React from 'react';
import { UILanguage, DEVELOPER_PROFILE } from '../types';
import { translations } from '../i18n/translations';
import { Github, Linkedin, Globe, Code2 } from 'lucide-react';

interface DeveloperCreditProps {
  lang: UILanguage;
}

export const DeveloperCredit: React.FC<DeveloperCreditProps> = ({ lang }) => {
  const t = translations[lang].developer;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500/70 relative z-10 px-2">
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
          href={DEVELOPER_PROFILE.linkedin}
          target="_blank"
          rel="me noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors"
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
};

