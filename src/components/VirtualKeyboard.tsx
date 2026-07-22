/**
 * @file VirtualKeyboard.tsx
 * @description Interactive QWERTY <-> Arabic Physical Keyboard Layout Map Visualizer.
 */

import React, { useState } from 'react';
import { UILanguage, KeyboardPlatform } from '../types';
import { translations } from '../i18n/translations';
import { getKeyMaps } from '../core/domain/entities/keymap';
import { Monitor, Laptop } from 'lucide-react';

interface VirtualKeyboardProps {
  lang: UILanguage;
  activeKey?: string;
  onKeyClick?: (char: string) => void;
  platform?: KeyboardPlatform;
}

const KEYBOARD_ROWS = [
  [
    { en: '`', winAr: 'ذ', macAr: '§' },
    { en: '1', winAr: '١', macAr: '١' },
    { en: '2', winAr: '٢', macAr: '٢' },
    { en: '3', winAr: '٣', macAr: '٣' },
    { en: '4', winAr: '٤', macAr: '٤' },
    { en: '5', winAr: '٥', macAr: '٥' },
    { en: '6', winAr: '٦', macAr: '٦' },
    { en: '7', winAr: '٧', macAr: '٧' },
    { en: '8', winAr: '٨', macAr: '٨' },
    { en: '9', winAr: '٩', macAr: '٩' },
    { en: '0', winAr: '٠', macAr: '٠' },
    { en: '-', winAr: '-', macAr: '-' },
    { en: '=', winAr: '=', macAr: '=' },
  ],
  [
    { en: 'q', winAr: 'ض', macAr: 'ض' },
    { en: 'w', winAr: 'ص', macAr: 'ص' },
    { en: 'e', winAr: 'ث', macAr: 'ث' },
    { en: 'r', winAr: 'ق', macAr: 'ق' },
    { en: 't', winAr: 'ف', macAr: 'ف' },
    { en: 'y', winAr: 'غ', macAr: 'غ' },
    { en: 'u', winAr: 'ع', macAr: 'ع' },
    { en: 'i', winAr: 'ه', macAr: 'ه' },
    { en: 'o', winAr: 'خ', macAr: 'خ' },
    { en: 'p', winAr: 'ح', macAr: 'ح' },
    { en: '[', winAr: 'ج', macAr: 'ج' },
    { en: ']', winAr: 'د', macAr: 'ة' },
    { en: '\\', winAr: '\\', macAr: '\\' },
  ],
  [
    { en: 'a', winAr: 'ش', macAr: 'ش' },
    { en: 's', winAr: 'س', macAr: 'س' },
    { en: 'd', winAr: 'ي', macAr: 'ي' },
    { en: 'f', winAr: 'ب', macAr: 'ب' },
    { en: 'g', winAr: 'ل', macAr: 'ل' },
    { en: 'h', winAr: 'ا', macAr: 'ا' },
    { en: 'j', winAr: 'ت', macAr: 'ت' },
    { en: 'k', winAr: 'ن', macAr: 'ن' },
    { en: 'l', winAr: 'م', macAr: 'م' },
    { en: ';', winAr: 'ك', macAr: 'ك' },
    { en: "'", winAr: 'ط', macAr: '؛' },
  ],
  [
    { en: 'z', winAr: 'ئ', macAr: 'ظ' },
    { en: 'x', winAr: 'ء', macAr: 'ط' },
    { en: 'c', winAr: 'ؤ', macAr: 'ذ' },
    { en: 'v', winAr: 'ر', macAr: 'د' },
    { en: 'b', winAr: 'لا', macAr: 'ز' },
    { en: 'n', winAr: 'ى', macAr: 'ر' },
    { en: 'm', winAr: 'ة', macAr: 'و' },
    { en: ',', winAr: 'و', macAr: '،' },
    { en: '.', winAr: 'ز', macAr: '.' },
    { en: '/', winAr: 'ظ', macAr: '/' },
  ],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  lang,
  activeKey,
  onKeyClick,
  platform = 'windows',
}) => {
  const t = translations[lang];
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [currentPlatform, setCurrentPlatform] = useState<KeyboardPlatform>(platform);

  const { en2ar } = getKeyMaps(currentPlatform);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t.virtualKeyboard.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{t.virtualKeyboard.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPlatform('windows')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPlatform === 'windows'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows</span>
            </button>
            <button
              onClick={() => setCurrentPlatform('mac')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPlatform === 'mac'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Mac</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>

          <button
            onClick={() => setShiftPressed(!shiftPressed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              shiftPressed
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            ⇧ Shift ({shiftPressed ? 'ON' : 'OFF'})
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto pb-2 scrollbar-none">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5 min-w-[680px]">
            {row.map((k) => {
              const displayEn = shiftPressed ? k.en.toUpperCase() : k.en;
              const mappedAr = en2ar[displayEn] || (currentPlatform === 'mac' ? k.macAr : k.winAr);

              const isActive =
                activeKey &&
                (activeKey.toLowerCase() === k.en.toLowerCase() ||
                  activeKey === mappedAr);

              return (
                <button
                  key={k.en}
                  onClick={() => onKeyClick && onKeyClick(displayEn)}
                  className={`relative w-12 h-12 rounded-xl flex flex-col justify-between p-1.5 border transition-all duration-150 select-none ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-900/40 border-sky-400 dark:border-sky-500 scale-110 shadow-lg shadow-sky-500/20 z-10'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-sky-300 dark:hover:border-sky-600'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold text-left ${isActive ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500'}`}>
                    {displayEn}
                  </span>
                  <span className={`text-sm font-bold text-right font-sans ${isActive ? 'text-sky-800 dark:text-sky-200 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                    {mappedAr}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
