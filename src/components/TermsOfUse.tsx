/**
 * @file TermsOfUse.tsx
 * @description Terms of Use page for KeyFixer — bilingual (EN/AR).
 * URL: /terms
 */

import React, { useState, useEffect } from 'react';
import { UILanguage } from '../types';
import { FileText, CheckCircle, XCircle, AlertTriangle, Globe, RefreshCw, Handshake } from 'lucide-react';

const content = {
  en: {
    title: 'Terms of Use',
    subtitle: 'Simple, fair terms for using KeyFixer. No legalese — just plain language.',
    lastUpdated: 'Last updated: August 1, 2025',
    backToApp: '← Back to KeyFixer',
    sections: [
      {
        icon: 'check',
        title: 'Acceptance',
        text: 'By using KeyFixer (the website at keyfixer.vercel.app, the Chrome Extension, or the macOS desktop app), you agree to these Terms of Use. If you do not agree, please stop using the service.',
      },
      {
        icon: 'handshake',
        title: 'What KeyFixer Provides',
        text: 'KeyFixer is a free, open-source utility that converts text between Arabic and English keyboard layouts. It is provided "as is", without warranties of any kind.\n\nKeyFixer is:\n• Free to use for personal and commercial purposes\n• Open source (MIT License) — source code available on GitHub\n• Fully offline — no account, no sign-up required',
      },
      {
        icon: 'check',
        title: 'Permitted Use',
        text: 'You may freely:\n• Use KeyFixer for any personal or professional purpose\n• Integrate it into your own workflows\n• Share it with others\n• Contribute to the open-source project on GitHub\n• Fork it under the terms of the MIT License',
      },
      {
        icon: 'x',
        title: 'Prohibited Use',
        text: 'You may not:\n• Use KeyFixer for any illegal activity\n• Reverse-engineer the extension in ways that violate the MIT License\n• Represent KeyFixer as your own product without attribution\n• Use the KeyFixer name or logo to imply endorsement without permission\n• Redistribute a modified version under the same name without clear indication of changes',
      },
      {
        icon: 'alert',
        title: 'Disclaimer of Warranties',
        text: 'KeyFixer is provided "as is" and "as available" without any warranties, express or implied. The developer does not guarantee that:\n• The service will be error-free or uninterrupted\n• The conversion results will always be perfect\n• The extension will be compatible with all websites or configurations\n\nUse at your own discretion.',
      },
      {
        icon: 'refresh',
        title: 'Changes to These Terms',
        text: 'These terms may be updated from time to time. The "Last updated" date at the top of this page will reflect any changes. Continued use of KeyFixer after changes constitutes acceptance of the new terms.',
      },
      {
        icon: 'handshake',
        title: 'Contact',
        text: 'Questions about these terms? Contact the developer:\n\nObada Dallo\nhttps://obadadallo.web.app/\nhttps://github.com/obadadallo95',
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    subtitle: 'شروط بسيطة وعادلة لاستخدام KeyFixer. بلغة واضحة بدون تعقيدات قانونية.',
    lastUpdated: 'آخر تحديث: 1 أغسطس 2025',
    backToApp: '→ العودة إلى KeyFixer',
    sections: [
      {
        icon: 'check',
        title: 'القبول',
        text: 'باستخدامك لـ KeyFixer (الموقع على keyfixer.vercel.app، أو إضافة كروم، أو تطبيق macOS)، فأنت توافق على شروط الاستخدام هذه. إذا كنت لا توافق، يرجى التوقف عن استخدام الخدمة.',
      },
      {
        icon: 'handshake',
        title: 'ما يقدمه KeyFixer',
        text: 'KeyFixer أداة مجانية مفتوحة المصدر تحوّل النصوص بين لوحات مفاتيح العربية والإنجليزية. تُقدَّم "كما هي"، بدون ضمانات من أي نوع.\n\nKeyFixer:\n• مجاني للاستخدام الشخصي والتجاري\n• مفتوح المصدر (رخصة MIT) — الكود متاح على GitHub\n• يعمل بالكامل بدون إنترنت — لا حساب، لا تسجيل مطلوب',
      },
      {
        icon: 'check',
        title: 'الاستخدام المسموح',
        text: 'يحق لك:\n• استخدام KeyFixer لأي غرض شخصي أو مهني\n• دمجه في سير عملك الخاص\n• مشاركته مع الآخرين\n• المساهمة في المشروع المفتوح المصدر على GitHub\n• تفريعه (fork) وفق شروط رخصة MIT',
      },
      {
        icon: 'x',
        title: 'الاستخدام المحظور',
        text: 'لا يحق لك:\n• استخدام KeyFixer في أي نشاط غير قانوني\n• إعادة هندسة الإضافة بطرق تنتهك رخصة MIT\n• تقديم KeyFixer كمنتجك الخاص دون نسب\n• استخدام اسم أو شعار KeyFixer للإيحاء بتأييد دون إذن\n• إعادة توزيع نسخة معدّلة تحت الاسم نفسه دون الإشارة الواضحة للتغييرات',
      },
      {
        icon: 'alert',
        title: 'إخلاء مسؤولية الضمانات',
        text: 'يُقدَّم KeyFixer "كما هو" و"كما هو متاح" بدون أي ضمانات صريحة أو ضمنية. المطوّر لا يضمن:\n• أن الخدمة ستكون خالية من الأخطاء أو غير منقطعة\n• أن نتائج التحويل ستكون مثالية دائماً\n• أن الإضافة ستكون متوافقة مع جميع المواقع أو الإعدادات\n\nاستخدمها وفق تقديرك الخاص.',
      },
      {
        icon: 'refresh',
        title: 'التغييرات على هذه الشروط',
        text: 'قد تُحدَّث هذه الشروط من وقت لآخر. تاريخ "آخر تحديث" أعلى هذه الصفحة سيعكس أي تغييرات. الاستمرار في استخدام KeyFixer بعد التغييرات يعني قبول الشروط الجديدة.',
      },
      {
        icon: 'handshake',
        title: 'التواصل',
        text: 'أسئلة حول هذه الشروط؟ تواصل مع المطور:\n\nعبادة دللو\nhttps://obadadallo.web.app/\nhttps://github.com/obadadallo95',
      },
    ],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-5 h-5" />,
  x: <XCircle className="w-5 h-5" />,
  alert: <AlertTriangle className="w-5 h-5" />,
  refresh: <RefreshCw className="w-5 h-5" />,
  handshake: <Handshake className="w-5 h-5" />,
  file: <FileText className="w-5 h-5" />,
};

const iconColor: Record<string, string> = {
  check: 'text-green-400',
  x: 'text-red-400',
  alert: 'text-yellow-400',
  refresh: 'text-blue-400',
  handshake: 'text-amber-400',
  file: 'text-amber-400',
};

export default function TermsOfUse() {
  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'شروط الاستخدام – KeyFixer' : 'Terms of Use – KeyFixer';
  }, [lang]);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="KeyFixer" className="h-8 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            {t.backToApp}
          </a>
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/30 text-xs font-bold text-slate-400 hover:text-amber-400 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-20">
        {/* Title */}
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <FileText className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Fair & Simple' : 'بسيطة وعادلة'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.title}</h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">{t.subtitle}</p>
          <p className="text-slate-600 text-xs mt-4">{t.lastUpdated}</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {t.sections.map((section, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-amber-500/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={iconColor[section.icon]}>{iconMap[section.icon]}</div>
                <h2 className="text-white font-bold text-base">{section.title}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{section.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div className="mt-10 flex items-center justify-center gap-4 text-sm text-slate-600">
          <a href="/privacy" className="hover:text-amber-400 transition-colors underline underline-offset-4">
            {lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
          </a>
          <span>·</span>
          <a href="/" className="hover:text-amber-400 transition-colors underline underline-offset-4">
            {lang === 'en' ? 'Back to App' : 'العودة للأداة'}
          </a>
        </div>
      </main>
    </div>
  );
}
