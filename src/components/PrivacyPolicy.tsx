/**
 * @file PrivacyPolicy.tsx
 * @description Privacy Policy page for KeyFixer — bilingual (EN/AR).
 * URL: /privacy
 */

import React, { useState, useEffect } from 'react';
import { UILanguage } from '../types';
import { Shield, Lock, Database, Eye, Server, Mail, Globe } from 'lucide-react';

const content = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'KeyFixer respects your privacy. Here\'s exactly what we do — and don\'t do — with your data.',
    lastUpdated: 'Last updated: August 1, 2026',
    backToApp: '← Back to KeyFixer',
    sections: [
      {
        icon: 'shield',
        title: 'Our Core Commitment',
        text: 'KeyFixer is built with privacy as a first principle. Your text is never sent to any server. All keyboard layout conversions happen entirely on your device — offline, instantly, and privately.',
      },
      {
        icon: 'database',
        title: 'Data We Collect',
        text: 'We collect no personal data whatsoever. KeyFixer does not collect, transmit, store, or share:\n- The text you type or paste\n- Your browsing history or visited websites\n- Any personally identifiable information\n- Device identifiers or IP addresses',
      },
      {
        icon: 'lock',
        title: 'Local Storage (Preferences Only)',
        text: 'The extension and web app save your preferences locally on your device only:\n- Your selected keyboard platform (Windows / macOS)\n- Your selected conversion mode (Auto / EN→AR / AR→EN)\n- Your UI language preference (English / Arabic)\n\nThis data never leaves your device and is never transmitted to any server.',
      },
      {
        icon: 'eye',
        title: 'Permissions Explained',
        text: 'The Chrome Extension requests these permissions:\n\n• contextMenus — To add KeyFixer actions when you right-click selected text.\n• storage — To remember your platform, mode, and language preferences on this device.\n• clipboardWrite — To copy the fixed text when you request it.\n• activeTab and scripting — To run on the current page only after you explicitly choose a KeyFixer context-menu action.\n\nThe extension declares no host permissions and has no persistent access to every website. None of these permissions are used to collect or transmit data.',
      },
      {
        icon: 'server',
        title: 'Third-Party Services',
        text: 'The KeyFixer website (keyfixer.vercel.app) uses:\n\n• Vercel Analytics — anonymized, aggregated page view statistics with no personal identification. See Vercel\'s privacy policy at vercel.com/legal/privacy-policy.\n\nThe Chrome Extension itself uses no third-party services.',
      },
      {
        icon: 'mail',
        title: 'Contact',
        text: 'For any privacy questions or concerns, contact the developer:\n\nObada Dallo\nhttps://obadadallo.web.app/\nhttps://github.com/obadadallo95',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    subtitle: 'KeyFixer يحترم خصوصيتك. إليك بالضبط ما نفعله — وما لا نفعله — ببياناتك.',
    lastUpdated: 'آخر تحديث: 1 أغسطس 2026',
    backToApp: '→ العودة إلى KeyFixer',
    sections: [
      {
        icon: 'shield',
        title: 'التزامنا الأساسي',
        text: 'بُني KeyFixer مع الخصوصية كمبدأ أول. نصك لا يُرسل أبداً إلى أي خادم. جميع تحويلات لوحة المفاتيح تتم بالكامل على جهازك — بدون إنترنت، فوراً، وبخصوصية تامة.',
      },
      {
        icon: 'database',
        title: 'البيانات التي نجمعها',
        text: 'لا نجمع أي بيانات شخصية على الإطلاق. KeyFixer لا يجمع أو يرسل أو يخزن أو يشارك:\n- النصوص التي تكتبها أو تلصقها\n- سجل التصفح أو المواقع التي تزورها\n- أي معلومات تعريفية شخصية\n- معرّفات الجهاز أو عناوين IP',
      },
      {
        icon: 'lock',
        title: 'التخزين المحلي (التفضيلات فقط)',
        text: 'تحفظ الإضافة والموقع تفضيلاتك محلياً على جهازك فقط:\n- منصة لوحة المفاتيح المختارة (ويندوز / ماك)\n- وضع التحويل المختار (تلقائي / EN→AR / AR→EN)\n- تفضيل لغة الواجهة (إنجليزي / عربي)\n\nهذه البيانات لا تغادر جهازك أبداً ولا تُرسل إلى أي خادم.',
      },
      {
        icon: 'eye',
        title: 'شرح الصلاحيات',
        text: 'إضافة كروم تطلب هذه الصلاحيات:\n\n• contextMenus — لإضافة أوامر KeyFixer عند النقر اليميني على النص المحدد.\n• storage — لتذكر تفضيلات المنصة والوضع واللغة على هذا الجهاز.\n• clipboardWrite — لنسخ النص المصحح عندما تطلب ذلك.\n• activeTab وscripting — للعمل على الصفحة الحالية فقط بعد اختيارك الصريح لأمر KeyFixer من القائمة.\n\nلا تعلن الإضافة أي صلاحيات مواقع، ولا تملك وصولاً دائماً إلى كل المواقع. لا تُستخدم أي من هذه الصلاحيات لجمع أو إرسال بيانات.',
      },
      {
        icon: 'server',
        title: 'خدمات الطرف الثالث',
        text: 'موقع KeyFixer (keyfixer.vercel.app) يستخدم:\n\n• Vercel Analytics — إحصاءات مجهولة ومجمّعة لمشاهدات الصفحات بدون تعريف شخصي. راجع سياسة خصوصية Vercel على vercel.com/legal/privacy-policy.\n\nإضافة كروم نفسها لا تستخدم أي خدمات طرف ثالث.',
      },
      {
        icon: 'mail',
        title: 'التواصل',
        text: 'لأي استفسارات أو مخاوف تتعلق بالخصوصية، تواصل مع المطور:\n\nعبادة دللو\nhttps://obadadallo.web.app/\nhttps://github.com/obadadallo95',
      },
    ],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="w-5 h-5" />,
  lock: <Lock className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
  server: <Server className="w-5 h-5" />,
  mail: <Mail className="w-5 h-5" />,
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'سياسة الخصوصية – KeyFixer' : 'Privacy Policy – KeyFixer';
  }, [lang]);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
        >
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
            <Shield className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Privacy First' : 'الخصوصية أولاً'}
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
                <div className="text-amber-400">{iconMap[section.icon]}</div>
                <h2 className="text-white font-bold text-base">{section.title}</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{section.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
            <Shield className="w-4 h-4" />
            {lang === 'en'
              ? 'KeyFixer: 100% offline, 0 data collected.'
              : 'KeyFixer: 100% بدون إنترنت، 0 بيانات مجمّعة.'}
          </div>
        </div>
      </main>
    </div>
  );
}
