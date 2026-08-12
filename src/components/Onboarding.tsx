import React, { useEffect, useState } from 'react';
import { Check, Keyboard, LockKeyhole, Rocket, ShieldCheck } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { convertKeyboardLayout } from '../core/keyboard';

export const ONBOARDING_STORAGE_KEY = 'keyfixer_onboarding_v1_complete';

export function Onboarding({ isRTL, onDone }: { isRTL: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState('lsgh');
  const [demoComplete, setDemoComplete] = useState(false);
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  useEffect(() => {
    invoke<boolean>('is_launch_at_login_enabled').then(setLaunchAtLogin).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.metaKey && event.code === 'KeyK') {
        event.preventDefault();
        setSample(convertKeyboardLayout(sample, { mode: 'auto', platform: 'mac' }).fixedText);
        setDemoComplete(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [sample, step]);

  const finish = async () => {
    await invoke('set_launch_at_login', { enabled: launchAtLogin }).catch(() => {});
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onDone();
  };

  const skip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onDone();
  };

  const copy = isRTL ? {
    skip: 'تخطي', next: 'التالي', finish: 'ابدأ باستخدام KeyFixer',
    title1: 'اكتب بلغتك، حتى لو كان التخطيط خاطئاً',
    body1: 'KeyFixer يصحح النص العربي والإنجليزي محلياً على جهازك، بدون رفع النص أو تخزينه.',
    title2: 'جرّب الاختصار الآن',
    body2: 'ضع المؤشر في المثال، حدّد النص، ثم اضغط ⌥⌘K. يبدأ التصحيح عند رفع إصبعك عن K.',
    success: 'ممتاز! هكذا يعمل التصحيح المباشر داخل أي تطبيق.',
    title3: 'جاهز دائماً عندما تحتاجه',
    body3: 'فعّل التشغيل عند تسجيل الدخول ليبقى KeyFixer متاحاً من شريط القوائم بدون فتح النافذة.',
    login: 'تشغيل KeyFixer عند تسجيل الدخول', privacy: 'المعالجة محلية ولا تتم مشاركة النصوص.',
  } : {
    skip: 'Skip', next: 'Next', finish: 'Start using KeyFixer',
    title1: 'Type in your language—even on the wrong layout',
    body1: 'KeyFixer corrects Arabic and English text locally on your Mac. Your text is never uploaded or stored.',
    title2: 'Try the shortcut',
    body2: 'Focus and select the sample, then press ⌥⌘K. Correction starts when you release K.',
    success: 'Perfect! Inline Fix works the same way inside other applications.',
    title3: 'Ready whenever you need it',
    body3: 'Launch KeyFixer at login so it remains available from the menu bar without keeping the window open.',
    login: 'Launch KeyFixer at login', privacy: 'Processing stays local and your text is never shared.',
  };

  const icons = [<Rocket size={30} />, <Keyboard size={30} />, <ShieldCheck size={30} />];
  const titles = [copy.title1, copy.title2, copy.title3];
  const bodies = [copy.body1, copy.body2, copy.body3];

  return (
    <div className="kf-onboarding-overlay" dir={isRTL ? 'rtl' : 'ltr'} data-testid="onboarding">
      <section className="kf-onboarding-card">
        <button className="kf-onboarding-skip" onClick={skip}>{copy.skip}</button>
        <div className="kf-onboarding-icon">{icons[step]}</div>
        <h2>{titles[step]}</h2>
        <p>{bodies[step]}</p>

        {step === 1 && (
          <div className={`kf-onboarding-demo${demoComplete ? ' is-complete' : ''}`}>
            <input value={sample} onChange={(event) => { setSample(event.target.value); setDemoComplete(false); }} dir="auto" aria-label="Inline Fix demo" />
            <kbd>⌥⌘K</kbd>
            {demoComplete && <span><Check size={14} /> {copy.success}</span>}
          </div>
        )}

        {step === 2 && (
          <div className="kf-onboarding-options">
            <label>
              <input type="checkbox" checked={launchAtLogin} onChange={(event) => setLaunchAtLogin(event.target.checked)} />
              <span>{copy.login}</span>
            </label>
            <div><LockKeyhole size={15} /> <span>{copy.privacy}</span></div>
          </div>
        )}

        <div className="kf-onboarding-footer">
          <div className="kf-onboarding-dots">{[0, 1, 2].map((index) => <i key={index} className={index === step ? 'active' : ''} />)}</div>
          <button onClick={() => step === 2 ? finish() : setStep(step + 1)}>{step === 2 ? copy.finish : copy.next}</button>
        </div>
      </section>
    </div>
  );
}
