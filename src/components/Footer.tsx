/**
 * @file Footer.tsx
 * @description Application Footer.
 */

import React from 'react';
import { UILanguage, DEVELOPER_PROFILE } from '../types';
import { translations } from '../i18n/translations';
import { Keyboard, Heart } from 'lucide-react';

interface FooterProps {
  lang: UILanguage;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer className="mt-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center text-white">
            <Keyboard className="w-4 h-4" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold">KeyFixer</span>
        </div>

        <div className="flex items-center gap-1">
          <span>Engineered with</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>by</span>
          <a
            href={DEVELOPER_PROFILE.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 dark:text-sky-400 hover:underline font-bold"
          >
            Obada Dallo (عبادة دللو)
          </a>
        </div>
      </div>
    </footer>
  );
};
