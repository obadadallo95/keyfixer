import React, { useEffect, useRef, useState } from 'react';
import { Check, Keyboard, LockKeyhole, Rocket, Sparkles } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { convertKeyboardLayout } from '../core/keyboard';

export const ONBOARDING_STORAGE_KEY = 'keyfixer_onboarding_v1_complete';

interface OnboardingProps {
  isRTL: boolean;
  lang?: 'en' | 'ar' | 'de';
  platform?: 'mac' | 'windows';
  onDone: () => void;
}

export function Onboarding({ isRTL, lang = isRTL ? 'ar' : 'en', platform = 'mac', onDone }: OnboardingProps) {
  const isWindows = platform === 'windows';
  const shortcutLabel = isWindows ? 'Ctrl+Alt+K' : '⌥⌘K';
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState('lnpfh f;');
  const [demoComplete, setDemoComplete] = useState(false);
  const demoCompleteRef = useRef(false);
  const [launchAtLogin, setLaunchAtLogin] = useState(false);

  const effectiveLang: 'en' | 'ar' | 'de' = lang === 'ar' || isRTL ? 'ar' : (lang === 'de' ? 'de' : 'en');

  useEffect(() => {
    invoke<boolean>('is_launch_at_login_enabled').then(setLaunchAtLogin).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    const completeDemo = () => {
      if (demoCompleteRef.current) return;
      demoCompleteRef.current = true;
      setSample((current) => convertKeyboardLayout(current, { mode: 'auto', platform: isWindows ? 'windows' : 'mac' }).fixedText);
      setDemoComplete(true);
    };
    const handleShortcut = (event: KeyboardEvent) => {
      const isMatch = isWindows
        ? (event.ctrlKey && event.altKey && event.code === 'KeyK')
        : (event.altKey && event.metaKey && event.code === 'KeyK');
      if (isMatch) {
        event.preventDefault();
        completeDemo();
      }
    };
    window.addEventListener('keyup', handleShortcut);
    let unlisten: (() => void) | undefined;
    listen<void>('global-shortcut-k-released', completeDemo).then((dispose) => { unlisten = dispose; }).catch(() => {});
    return () => {
      window.removeEventListener('keyup', handleShortcut);
      unlisten?.();
    };
  }, [step, isWindows]);

  const finish = async () => {
    await invoke('set_launch_at_login', { enabled: launchAtLogin }).catch(() => {});
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onDone();
  };

  const skip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onDone();
  };

  const copy = effectiveLang === 'ar' ? {
    skip: 'تخطي',
    next: 'التالي',
    finish: 'ابدأ باستخدام KeyFixer',
    title1: 'اكتب بلغتك بحرية تامة',
    body1: isWindows
      ? 'KeyFixer يصحح النصوص المكتوبة باللغة الخاطئة محلياً بالكامل على جهازك، بدون خوادم خارجية.'
      : 'KeyFixer يصحح النصوص المكتوبة باللغة الخاطئة محلياً بالكامل على جهاز الماك، بدون خوادم خارجية.',
    title2: 'التصحيح الفوري بالاختصار',
    body2: isWindows
      ? `ضع المؤشر في المثال، حدّد النص، ثم اضغط ${shortcutLabel} ليتم تصحيحه مكانه فوراً.`
      : `حدد النص ثم اضغط ${shortcutLabel} لتصحيحه فوراً في مكانه عبر خدمات macOS الأصلية بدون أي إذن لتسهيلات الاستخدام.`,
    success: 'ممتاز! هكذا يعمل التصحيح الفوري داخل التطبيقات وحقول النص المدعومة.',
    title3: 'جاهز دائماً عندما تحتاجه',
    body3: isWindows
      ? 'فعّل التشغيل التلقائي ليبقى KeyFixer متاحاً من شريط المهام (System Tray).'
      : 'فعّل التشغيل عند تسجيل الدخول ليبقى KeyFixer متاحاً من شريط القوائم دائماً.',
    login: isWindows ? 'تشغيل KeyFixer عند بدء تشغيل Windows' : 'تشغيل KeyFixer عند تسجيل الدخول',
    privacy: 'تتم معالجة النصوص محلياً بالكامل على جهازك.',
  } : effectiveLang === 'de' ? {
    skip: 'Überspringen',
    next: 'Weiter',
    finish: 'KeyFixer starten',
    title1: 'Tippen Sie frei auf Arabisch und Englisch',
    body1: isWindows
      ? 'KeyFixer korrigiert falsche Tastaturlayouts lokal auf Ihrem PC – ohne externe Server.'
      : 'KeyFixer korrigiert falsche Tastaturlayouts lokal auf Ihrem Mac – ohne externe Server.',
    title2: 'Sofort-Korrektur mit Kurzbefehl',
    body2: isWindows
      ? `Markieren Sie den Text und drücken Sie ${shortcutLabel} für eine sofortige Korrektur.`
      : `Text markieren → ${shortcutLabel} drücken → sofort korrigiert. Nutzt native macOS-Dienste ganz ohne Bedienungshilfen-Berechtigung.`,
    success: 'Perfekt! So funktioniert die Sofort-Korrektur in unterstützten Textfeldern.',
    title3: 'Jederzeit einsatzbereit',
    body3: isWindows
      ? 'Starten Sie KeyFixer automatisch im System Tray für schnellen Zugriff.'
      : 'Starten Sie KeyFixer bei der Anmeldung, damit es in der Menüleiste bereitsteht.',
    login: isWindows ? 'KeyFixer beim Windows-Start ausführen' : 'KeyFixer bei der Anmeldung starten',
    privacy: 'Die Textkonvertierung erfolgt zu 100 % lokal auf Ihrem Gerät.',
  } : {
    skip: 'Skip',
    next: 'Next',
    finish: 'Start using KeyFixer',
    title1: 'Type in your language—even on the wrong layout',
    body1: isWindows
      ? 'KeyFixer corrects mistyped keyboard layouts locally on your PC. No external text servers.'
      : 'KeyFixer corrects mistyped keyboard layouts locally on your Mac. No external text servers.',
    title2: 'Instant Fix with Shortcut',
    body2: isWindows
      ? `Focus and select the sample, then press ${shortcutLabel} to correct it in place.`
      : `Select text and press ${shortcutLabel} to correct it instantly in place via native macOS Services with zero Accessibility permissions.`,
    success: 'Perfect! Instant Fix works inside supported apps and text fields.',
    title3: 'Ready whenever you need it',
    body3: isWindows
      ? 'Launch KeyFixer on startup so it remains available from the System Tray.'
      : 'Launch KeyFixer at login so it remains available from the menu bar.',
    login: isWindows ? 'Launch KeyFixer on Windows startup' : 'Launch KeyFixer at login',
    privacy: 'Text conversion stays 100% local on your Mac.',
  };

  const icons = [<Rocket size={30} />, <Keyboard size={30} />, <Sparkles size={30} />];
  const titles = [copy.title1, copy.title2, copy.title3];
  const bodies = [copy.body1, copy.body2, copy.body3];

  return (
    <div className={`kf-onboarding-overlay${isWindows ? ' kf-onboarding-windows' : ''}`} dir={effectiveLang === 'ar' ? 'rtl' : 'ltr'} data-testid="onboarding">
      <section className={`kf-onboarding-card${isWindows ? ' kf-onboarding-card-windows' : ''}`}>
        <button className="kf-onboarding-skip" onClick={skip}>{copy.skip}</button>
        <div className="kf-onboarding-icon">{icons[step]}</div>
        <h2>{titles[step]}</h2>
        <p>{bodies[step]}</p>

        {step === 1 && (
          <div className={`kf-onboarding-demo${demoComplete ? ' is-complete' : ''}`}>
            <input value={sample} onChange={(event) => { setSample(event.target.value); demoCompleteRef.current = false; setDemoComplete(false); }} dir="auto" aria-label="Instant Fix demo" />
            <kbd>{shortcutLabel}</kbd>
            {demoComplete && <span><Check size={14} /> {copy.success}</span>}
          </div>
        )}

        {step === 2 && (
          <div className="kf-onboarding-options">
            <label>
              <input type="checkbox" checked={launchAtLogin} aria-label={copy.login} onChange={(event) => setLaunchAtLogin(event.target.checked)} />
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
