/**
 * @file LegalPage.tsx
 * @description Universal public legal page component for KeyFixer website.
 * Renders finalized legal content directly from src/legal/legalContent.ts.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LegalDocId, LEGAL_DOCUMENTS } from '../legal/legalContent';
import { UILanguage } from '../types';
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Scale,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DeveloperCredit } from './DeveloperCredit';
import { Analytics } from '@vercel/analytics/react';

interface LegalPageProps {
  initialDocId: LegalDocId;
}

const DOC_ORDER: { id: LegalDocId; path: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'privacy', path: '/privacy', icon: ShieldCheck },
  { id: 'terms', path: '/terms', icon: FileText },
  { id: 'purchase-refund', path: '/refund', icon: CreditCard },
  { id: 'impressum', path: '/impressum', icon: Scale },
  { id: 'accessibility', path: '/accessibility', icon: KeyRound },
];

function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('[') && token.includes('](')) {
      const label = token.substring(1, token.indexOf(']('));
      const url = token.substring(token.indexOf('](') + 2, token.length - 1);
      parts.push(
        <a
          key={match.index}
          href={url}
          target={url.startsWith('mailto:') ? undefined : '_blank'}
          rel={url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          className="text-amber-400 hover:text-amber-300 underline font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>{label}</span>
          {!url.startsWith('mailto:') && <ExternalLink className="w-3 h-3 inline-block opacity-70" />}
        </a>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="text-white font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-[13px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

function MarkdownRenderer({ content, isRTL }: { content: string; isRTL: boolean }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4 mt-2">
          {line.replace('# ', '')}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg sm:text-xl font-bold text-amber-400 mt-8 mb-3 border-b border-white/10 pb-2">
          {line.replace('## ', '')}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-bold text-slate-200 mt-6 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
      continue;
    }

    if (line.startsWith('---')) {
      elements.push(<hr key={i} className="border-0 h-px bg-white/10 my-6" />);
      continue;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className={`my-4 p-3.5 rounded-lg bg-amber-500/10 text-slate-300 italic text-sm ${
            isRTL ? 'border-r-4 border-amber-500 pr-4' : 'border-l-4 border-amber-500 pl-4'
          }`}
        >
          {line.replace('> ', '')}
        </blockquote>
      );
      continue;
    }

    const isBullet = line.startsWith('- ') || line.startsWith('• ');
    const isNum = /^\d+\.\s/.test(line);

    if (isBullet || isNum) {
      const stripped = rawLine.replace(/^[-•]\s|^\d+\.\s/, '');
      elements.push(
        <div key={i} className="flex gap-2.5 my-1.5 text-slate-300 text-sm leading-relaxed">
          <span className="text-amber-400 font-bold shrink-0">
            {isBullet ? '•' : line.match(/^\d+\./)?.[0]}
          </span>
          <div className="flex-1">{parseInlineFormatting(stripped)}</div>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className="my-2.5 text-slate-300 text-sm sm:text-[15px] leading-relaxed">
          {parseInlineFormatting(rawLine)}
        </p>
      );
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialDocId }) => {
  const [docId, setDocId] = useState<LegalDocId>(initialDocId);
  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });
  const [impressumLang, setImpressumLang] = useState<'de' | 'en'>('de');

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.classList.add('dark');
    localStorage.setItem('keyfixer_lang', lang);
  }, [lang, isRTL]);

  useEffect(() => {
    setDocId(initialDocId);
  }, [initialDocId]);

  const doc = LEGAL_DOCUMENTS[docId] || LEGAL_DOCUMENTS.privacy;

  // SEO: Update page title dynamically
  useEffect(() => {
    const titleMap: Record<LegalDocId, { en: string; ar: string }> = {
      privacy: { en: 'KeyFixer – Privacy Policy', ar: 'KeyFixer – سياسة الخصوصية' },
      terms: { en: 'KeyFixer – Terms of Use', ar: 'KeyFixer – شروط الاستخدام' },
      'purchase-refund': { en: 'KeyFixer – Purchase & Refund Policy', ar: 'KeyFixer – سياسة الشراء والاسترجاع' },
      impressum: { en: 'KeyFixer – Legal Notice / Impressum', ar: 'KeyFixer – المعلومات القانونية' },
      accessibility: { en: 'KeyFixer – Accessibility & Permissions', ar: 'KeyFixer – الأذونات وتسهيلات الاستخدام' },
    };
    const localized = titleMap[docId] || titleMap.privacy;
    document.title = isRTL ? localized.ar : localized.en;
  }, [docId, isRTL]);

  // Determine active markdown content
  const activeContent = useMemo(() => {
    if (docId === 'impressum') {
      if (lang === 'en') {
        return doc.contentEn;
      }
      return impressumLang === 'en' ? doc.contentEn : (doc.contentDe || doc.contentAr);
    }
    return isRTL ? doc.contentAr : doc.contentEn;
  }, [docId, doc, lang, isRTL, impressumLang]);

  const handleDocChange = (targetId: LegalDocId, targetPath: string) => {
    setDocId(targetId);
    window.history.pushState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-white/[0.06]">
        <a
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors group"
        >
          {isRTL ? (
            <>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              <span>العودة إلى KeyFixer</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Back to KeyFixer</span>
            </>
          )}
        </a>

        <div className="flex items-center gap-3">
          <button
            dir="ltr"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="relative flex items-center p-1 rounded-full bg-black/40 border border-white/10 hover:border-white/20 transition-all shadow-inner group"
            title="Toggle Language"
          >
            <div
              className={`absolute h-[28px] w-[56px] bg-amber-500 rounded-full transition-transform duration-300 ease-out shadow-md ${
                lang === 'en' ? 'translate-x-0' : 'translate-x-[56px]'
              }`}
            />
            <div
              className={`relative z-10 flex items-center justify-center h-[28px] w-[56px] text-[11px] font-bold tracking-widest transition-colors duration-300 ${
                lang === 'en' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              EN
            </div>
            <div
              className={`relative z-10 flex items-center justify-center h-[28px] w-[56px] text-[11px] font-bold tracking-wider transition-colors duration-300 ${
                lang === 'ar' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              عربي
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pb-4 mb-8 border-b border-white/[0.08] overflow-x-auto no-scrollbar scroll-smooth">
          {DOC_ORDER.map(item => {
            const docMeta = LEGAL_DOCUMENTS[item.id];
            const isActive = docId === item.id;
            const Icon = item.icon;
            const title = isRTL ? docMeta.titleAr : docMeta.titleEn;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDocChange(item.id, item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.05] hover:bg-white/[0.07] hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{title}</span>
              </button>
            );
          })}
        </div>

        {/* Legal Document Container */}
        <article className="rounded-2xl bg-[#0e0e11]/80 border border-white/[0.08] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Impressum Translation Toggle (if in Arabic/German mode) */}
          {docId === 'impressum' && lang === 'ar' && (
            <div className="mb-6 pb-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                {impressumLang === 'de'
                  ? 'المعلومات القانونية الألمانية النظامية (§ 5 DDG)'
                  : 'English Convenience Translation'}
              </span>
              <button
                type="button"
                onClick={() => setImpressumLang(impressumLang === 'de' ? 'en' : 'de')}
                className="text-xs px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-amber-400 transition-colors"
              >
                {impressumLang === 'de' ? 'English version' : 'النسخة الألمانية (System)'}
              </button>
            </div>
          )}

          <div className={isRTL && (docId !== 'impressum' || impressumLang !== 'de') ? 'text-right' : 'text-left'}>
            <MarkdownRenderer content={activeContent} isRTL={isRTL && (docId !== 'impressum' || impressumLang !== 'de')} />
          </div>
        </article>
      </main>

      {/* Footer on Every Public Page */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] py-6 mt-auto">
        <DeveloperCredit lang={lang} />
      </footer>

      <Analytics />
    </div>
  );
};
