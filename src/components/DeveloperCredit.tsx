/**
 * @file DeveloperCredit.tsx
 * @description A subtle, elegant, non-distracting developer credit component.
 */

import React from 'react';
import { UILanguage } from '../types';
import { translations } from '../i18n/translations';
import { Github, Linkedin, Globe, Code2 } from 'lucide-react';

interface DeveloperCreditProps {
  lang: UILanguage;
}

export const DeveloperCredit: React.FC<DeveloperCreditProps> = ({ lang }) => {
  const t = translations[lang].developer;

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 flex justify-center">
      <div className="group relative flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 backdrop-blur-sm">
        
        {/* Subtle Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 overflow-hidden group-hover:border-amber-500/30 transition-colors">
            <Code2 className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300 tracking-wide">
              {t.builtBy}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {t.role}
            </span>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-white/10 mx-2 relative z-10" />

        <div className="flex items-center gap-1.5 relative z-10">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A66C2] hover:bg-white/10 transition-all"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href="https://portfolio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-white/10 transition-all"
            title="Portfolio"
          >
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
