/**
 * @file AboutDeveloper.tsx
 * @description About the Developer page for KeyFixer.
 * URL: /about
 */

import React, { useState, useEffect } from 'react';
import { UILanguage, DEVELOPER_PROFILE } from '../types';
import { Github, Linkedin, Globe, Heart, Coffee, ArrowLeft } from 'lucide-react';

const content = {
  en: {
    title: 'About the Developer',
    role: DEVELOPER_PROFILE.role,
    bio: DEVELOPER_PROFILE.bio,
    backToApp: '← Back to KeyFixer',
    links: 'Links & Social',
    website: 'Website',
    sponsor: 'Sponsor on GitHub',
    support: 'Buy me a Coffee',
  },
  ar: {
    title: 'عن المطور',
    role: 'مهندس برمجيات وبناء منتجات تقنية',
    bio: 'مهتم ببناء أدوات مفتوحة المصدر وتطبيقات ويب سريعة وفعّالة تسهم في حل مشاكل يومية وتحسين تجربة المستخدم.',
    backToApp: 'العودة إلى KeyFixer →',
    links: 'الروابط والتواصل',
    website: 'الموقع الشخصي',
    sponsor: 'رعاية عبر GitHub',
    support: 'ادعم المشروع',
  },
};

export default function AboutDeveloper() {
  const [lang, setLang] = useState<UILanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('keyfixer_lang');
    if (saved === 'ar' || saved === 'en') setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${content[lang].title} | KeyFixer`;
  }, [lang]);

  const t = content[lang];
  const isAr = lang === 'ar';

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <a
          href="/"
          className="text-slate-400 hover:text-amber-500 font-medium transition-colors"
        >
          {t.backToApp}
        </a>
        <button
          dir="ltr"
          onClick={() => {
            const next = lang === 'en' ? 'ar' : 'en';
            setLang(next);
            localStorage.setItem('keyfixer_lang', next);
          }}
          className="relative flex items-center p-1 rounded-full bg-black/40 border border-white/10 hover:border-white/20 transition-all shadow-inner group"
        >
          <div
            className={`absolute h-[32px] w-[64px] bg-amber-500 rounded-full transition-transform duration-300 ease-out shadow-md ${
              lang === 'en' ? 'translate-x-0' : 'translate-x-[64px]'
            }`}
          />
          <div className={`relative z-10 flex items-center justify-center h-[32px] w-[64px] text-[12px] font-bold tracking-widest transition-colors duration-300 ${lang === 'en' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'}`}>
            EN
          </div>
          <div className={`relative z-10 flex items-center justify-center h-[32px] w-[64px] text-[12px] font-bold tracking-wider transition-colors duration-300 ${lang === 'ar' ? 'text-black' : 'text-slate-400 group-hover:text-slate-300'}`}>
            عربي
          </div>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-3xl mx-auto px-6 pb-20 flex flex-col items-center text-center mt-12">
        
        {/* Avatar */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl mb-6 relative group">
          <img 
            src={DEVELOPER_PROFILE.avatarUrl} 
            alt={isAr ? DEVELOPER_PROFILE.arabicName : DEVELOPER_PROFILE.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
        </div>

        {/* Info */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {isAr ? DEVELOPER_PROFILE.arabicName : DEVELOPER_PROFILE.name}
        </h1>
        <p className="text-amber-500 font-medium text-lg mb-6">{t.role}</p>
        
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-12">
          {t.bio}
        </p>

        {/* Links Grid */}
        <div className="w-full max-w-xl">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">{t.links}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={DEVELOPER_PROFILE.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group">
              <Globe className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
              <span className="font-medium text-slate-300 group-hover:text-white">{t.website}</span>
            </a>
            <a href={DEVELOPER_PROFILE.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all group">
              <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
              <span className="font-medium text-slate-300 group-hover:text-white">GitHub</span>
            </a>
            <a href={DEVELOPER_PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 transition-all group">
              <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-[#0A66C2]" />
              <span className="font-medium text-slate-300 group-hover:text-white">LinkedIn</span>
            </a>
            <a href={DEVELOPER_PROFILE.githubSponsors} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all group">
              <Heart className="w-5 h-5 text-slate-400 group-hover:text-pink-500 group-hover:fill-pink-500" />
              <span className="font-medium text-slate-300 group-hover:text-white">{t.sponsor}</span>
            </a>
          </div>

          <a href={DEVELOPER_PROFILE.donation} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/80 hover:bg-amber-500/20 transition-all group w-full">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-500 group-hover:text-amber-400">{t.support}</span>
          </a>
        </div>

      </main>
    </div>
  );
}
