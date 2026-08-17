import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProPanelProps, ProStateDto, UiState } from '../../src/pro/contracts';
import {
  Zap, Lock, CheckCircle2, ShieldAlert, ShieldCheck, Sparkles,
  X, Loader2, ArrowRight, RotateCcw, ExternalLink, RefreshCw, Info, HelpCircle
} from 'lucide-react';
import { listen } from '@tauri-apps/api/event';

// ── Constants ────────────────────────────────────────────────────────────────

const TOTAL_TRIAL_CREDITS = 25;

const FREE_STATE: ProStateDto = {
  mode: 'free',
  uiState: 'FREE',
  trialCreditsRemaining: 0,
  trialStarted: false,
  inlineFixEnabled: false,
  isAppStore: true,
};

function getProTranslations(lang: 'en' | 'ar' | 'de', isWindows: boolean) {
  const shortcut = isWindows ? 'Ctrl+Alt+K' : '⌥⌘K';
  const storeName = isWindows
    ? (lang === 'ar' ? 'متجر مايكروسوفت' : 'Microsoft Store')
    : 'App Store';
  const accountName = isWindows
    ? (lang === 'ar' ? 'حساب مايكروسوفت' : (lang === 'de' ? 'Microsoft-Konto' : 'Microsoft Account'))
    : (lang === 'ar' ? 'حساب Apple' : (lang === 'de' ? 'Apple Account' : 'Apple Account'));

  if (lang === 'ar') {
    return {
      tryPro: 'تجربة 25 تصحيحاً مجاناً',
      unlockPro: 'الترقية إلى Pro مدى الحياة',
      instantFix: 'التصحيح الفوري',
      trialTitle: 'جرّب KeyFixer Pro',
      trialDesc: `حدد النص المكتوب باللغة الخاطئة داخل أي تطبيق واضغط ${shortcut} ليتم تصحيحه فوراً في مكانه.`,
      trialF1: `تصحيح فوري ومباشر في نفس المكان باختصار ${shortcut}`,
      trialF2: isWindows
        ? 'تصحيح سريع ومباشر على مستوى النظام'
        : 'بدون أي إذن لتسهيلات الاستخدام عبر خدمات macOS الأصلية',
      trialF3: 'معالجة محلية للنصوص 100% داخل الذاكرة على جهاز الماك',
      compatNote: 'يعمل التصحيح الفوري في تطبيقات وحقول النص المدعومة على الماك.',
      fallbackNote: 'إذا لم يكن مدعوماً في تطبيق ما، يمكنك دائماً استخدام: نسخ ← KeyFixer ← تصحيح ← لصق.',
      trialStart: 'ابدأ التجربة المجانية (25 تصحيحاً)',
      trialLater: 'ربما لاحقاً',
      upgradeTitle: 'KeyFixer Pro مدى الحياة',
      upgradeDesc: 'تصحيح فوري غير محدود داخل التطبيقات المدعومة بشراء لمرة واحدة فقط.',
      upgradeF1: `تصحيح فوري غير محدود باختصار ${shortcut}`,
      upgradeF2: `شراء لمرة واحدة مدى الحياة عبر ${storeName} (بدون اشتراكات)`,
      upgradeF3: isWindows
        ? 'معالجة محلية بالكامل وتصحيح مباشر وسريع'
        : 'معالجة محلية بالكامل وبدون أي إذن لتسهيلات الاستخدام',
      upgradeF4: 'معالجة محلية بالكامل في الذاكرة المؤقتة',
      upgradeF5: 'الخصوصية أولاً ولا يتم تخزين أي نصوص',
      upgradeCta: 'الترقية إلى Pro مدى الحياة',
      upgradeNot: 'ليس الآن',
      purchaseUnavailable: 'الشراء غير متاح مؤقتًا',
      purchasePending: 'عملية الشراء بانتظار الموافقة',
      purchasePendingDesc: `عملية الشراء بانتظار الموافقة عبر ${storeName}. سيتم تفعيل KeyFixer Pro تلقائيًا فور تأكيدها.`,
      purchaseFailed: 'تعذر إكمال عملية الشراء. حاول مرة أخرى.',
      purchaseSuccess: 'تم تفعيل KeyFixer Pro',
      restoreBtn: 'استعادة المشتريات',
      restoring: 'جارٍ الاستعادة…',
      restoreSuccess: 'تم استعادة KeyFixer Pro بنجاح',
      restoreNotFound: `لم يتم العثور على شراء KeyFixer Pro مرتبط بـ ${accountName} هذا.`,
      restoreFailed: 'تعذر استعادة المشتريات. حاول مرة أخرى.',
      terms: 'الشروط',
      privacy: 'الخصوصية',
      refund: 'الشراء والاسترجاع',
      axTitle: 'إذن تسهيلات الاستخدام مطلوب',
      axDesc: 'يحتاج تطبيق KeyFixer إلى إذن تسهيلات الاستخدام (Accessibility) لقراءة النص المحدد وتصحيحه تلقائياً داخل التطبيقات الأخرى.',
      axStep1: 'اضغط على زر "فتح الإعدادات" أدناه',
      axStep2: 'ابحث عن KeyFixer في القائمة وفعّل المفتاح',
      axStep3: 'إذا كان موجوداً مسبقاً، حدده واضغط زر الناقص (-) لحذفه ثم أعد إضافته لربط النسخة الجديدة',
      axStep4: 'عد إلى هنا وأعد تشغيل KeyFixer حتى تقرأ العملية الجديدة الصلاحية',
      axOpen: 'فتح الإعدادات',
      axCheck: 'فحص مجددًا',
      axChecking: 'جارٍ التحقق من الإذن…',
      axGranted: 'تم منح الإذن بنجاح!',
      axDone: 'تم التفعيل والإغلاق',
    };
  }

  if (lang === 'de') {
    return {
      tryPro: '25 Fixes kostenlos testen',
      unlockPro: 'Pro Lifetime freischalten',
      instantFix: 'Sofort-Korrektur',
      trialTitle: 'KeyFixer Pro testen',
      trialDesc: `Markieren Sie falsch getippten Text in einer App und drücken Sie ${shortcut} für eine sofortige Korrektur an Ort und Stelle.`,
      trialF1: `Sofortige Korrektur an Ort und Stelle mit ${shortcut}`,
      trialF2: isWindows
        ? 'Schnelle systemweite Korrektur'
        : 'Keine Bedienungshilfen-Berechtigung dank nativer macOS-Dienste',
      trialF3: '100 % lokale Textkonvertierung im Arbeitsspeicher auf Ihrem Mac',
      compatNote: 'Die Sofort-Korrektur funktioniert in unterstützten Mac-Apps und Textfeldern.',
      fallbackNote: 'Falls nicht unterstützt: Kopieren → KeyFixer → Korrigieren → Einfügen steht immer bereit.',
      trialStart: 'Kostenlose Testphase starten (25 Fixes)',
      trialLater: 'Vielleicht später',
      upgradeTitle: 'KeyFixer Pro Lifetime',
      upgradeDesc: 'Unbegrenzte Sofort-Korrekturen in unterstützten Apps mit einem Einmalkauf.',
      upgradeF1: `Unbegrenzte Sofort-Korrekturen mit ${shortcut}`,
      upgradeF2: `Einmalkauf für lebenslange Nutzung via ${storeName} (kein Abo)`,
      upgradeF3: isWindows
        ? '100 % lokale Verarbeitung und direkte Textkorrektur'
        : '100 % lokale Textverarbeitung ohne Berechtigungen',
      upgradeF4: 'Volle Privatsphäre im Arbeitsspeicher',
      upgradeF5: 'Keine Speicherung von Texten',
      upgradeCta: 'Pro Lifetime freischalten',
      upgradeNot: 'Nicht jetzt',
      purchaseUnavailable: 'Kauf vorübergehend nicht verfügbar',
      purchasePending: 'Kauf wird geprüft',
      purchasePendingDesc: `Ihr Kauf wird im ${storeName} verarbeitet. KeyFixer Pro wird nach Bestätigung automatisch aktiviert.`,
      purchaseFailed: 'Der Kauf konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.',
      purchaseSuccess: 'KeyFixer Pro aktiviert',
      restoreBtn: 'Käufe wiederherstellen',
      restoring: 'Wird wiederhergestellt…',
      restoreSuccess: 'KeyFixer Pro wiederhergestellt',
      restoreNotFound: `Für diesen ${accountName} wurde kein KeyFixer Pro-Kauf gefunden.`,
      restoreFailed: 'Käufe konnten nicht wiederhergestellt werden. Bitte versuchen Sie es erneut.',
      terms: 'Bedingungen',
      privacy: 'Datenschutz',
      refund: 'Kauf & Erstattung',
      axTitle: 'Bedienungshilfen-Berechtigung erforderlich',
      axDesc: 'KeyFixer benötigt die Bedienungshilfen-Berechtigung, um markierten Text in anderen Apps direkt zu ersetzen.',
      axStep1: 'Klicken Sie unten auf „Einstellungen öffnen“',
      axStep2: 'Aktivieren Sie den Schalter neben KeyFixer',
      axStep3: 'Falls bereits gelistet, entfernen Sie den alten Eintrag mit (-) und fügen Sie KeyFixer neu hinzu',
      axStep4: 'Starten Sie KeyFixer anschließend neu',
      axOpen: 'Einstellungen öffnen',
      axCheck: 'Erneut prüfen',
      axChecking: 'Wird geprüft…',
      axGranted: 'Berechtigung erfolgreich erteilt!',
      axDone: 'Fertig & Schließen',
    };
  }

  // Default English
  return {
    tryPro: 'Try 25 Fixes Free',
    unlockPro: 'Unlock Pro Lifetime',
    instantFix: 'Instant Fix',
    trialTitle: 'Try KeyFixer Pro',
    trialDesc: `Select mistyped text in another app and press ${shortcut} to correct it instantly in place.`,
    trialF1: `Instant in-place correction with ${shortcut}`,
    trialF2: isWindows
      ? 'Fast system-wide correction'
      : 'Zero Accessibility permissions required via native macOS Services',
    trialF3: '100% local text conversion in RAM on your Mac',
    compatNote: 'Instant Fix works in supported Mac apps and text fields.',
    fallbackNote: 'If unavailable in an app, standard Copy → KeyFixer → Fix → Paste is always available.',
    trialStart: 'Start Free Trial (25 Fixes)',
    trialLater: 'Maybe Later',
    upgradeTitle: 'KeyFixer Pro Lifetime',
    upgradeDesc: 'Unlimited Instant Fixes across supported apps with a one-time purchase.',
    upgradeF1: `Unlimited Instant Fixes with ${shortcut}`,
    upgradeF2: `One-time purchase for lifetime use via ${storeName} (no subscriptions)`,
    upgradeF3: isWindows
      ? '100% local processing and fast in-app correction'
      : '100% local text processing & zero permissions',
    upgradeF4: 'Full privacy in transient memory',
    upgradeF5: 'No text is ever stored or uploaded',
    upgradeCta: 'Unlock Pro Lifetime',
    upgradeNot: 'Not Now',
    purchaseUnavailable: 'Purchase temporarily unavailable',
    purchasePending: 'Purchase pending approval',
    purchasePendingDesc: `Your purchase is pending approval with ${storeName}. KeyFixer Pro will unlock automatically once confirmed.`,
    purchaseFailed: "Purchase couldn't be completed. Please try again.",
    purchaseSuccess: 'KeyFixer Pro unlocked',
    restoreBtn: 'Restore Purchases',
    restoring: 'Restoring…',
    restoreSuccess: 'KeyFixer Pro restored',
    restoreNotFound: `No KeyFixer Pro purchase was found for this ${accountName}.`,
    restoreFailed: "Couldn't restore purchases. Please try again.",
    terms: 'Terms',
    privacy: 'Privacy',
    refund: 'Purchase & Refund',
    axTitle: 'Accessibility Permission Required',
    axDesc: 'KeyFixer needs macOS Accessibility permission to read and replace selected text directly in other applications.',
    axStep1: 'Click "Open Settings" below',
    axStep2: 'Find KeyFixer in the list and toggle the switch ON',
    axStep3: 'If already listed, click the (-) minus button to remove the old build, then re-add KeyFixer',
    axStep4: 'Return here and restart KeyFixer so the fresh process can read the new permission',
    axOpen: 'Open Settings',
    axCheck: 'Check Again',
    axChecking: 'Checking permission…',
    axGranted: 'Permission granted successfully!',
    axDone: 'Done & Close',
  };
}

// ── Helper: Derive UI State ──────────────────────────────────────────────────

function derived(dto: ProStateDto): UiState {
  if (dto.mode === 'paid') return 'PAID';
  if (dto.mode === 'trial' && dto.trialCreditsRemaining > 0) return 'TRIAL_ACTIVE';
  if (dto.mode === 'trial') return 'TRIAL_EXHAUSTED';
  return 'FREE';
}

// ── Main ProPanel Component ──────────────────────────────────────────────────

export function ProPanel({ bridge, isRTL, lang = isRTL ? 'ar' : 'en', platform = 'mac', onStatusChange, onOpenLegal }: ProPanelProps) {
  const isWindows = platform === 'windows';
  const effectiveLang: 'en' | 'ar' | 'de' = lang === 'ar' || isRTL ? 'ar' : (lang === 'de' ? 'de' : 'en');
  const t = getProTranslations(effectiveLang, isWindows);

  const [state, setState] = useState<ProStateDto>(FREE_STATE);
  const [uiState, setUiState] = useState<UiState>('FREE');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState<boolean | null>(null);

  // StoreKit 2 State
  const [storeProduct, setStoreProduct] = useState<{ id: string; displayName: string; displayPrice: string; isAvailable: boolean } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchasePending, setPurchasePending] = useState(false);
  const [purchaseSuccessToast, setPurchaseSuccessToast] = useState(false);

  // Restore Purchases State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const [showTrialWelcome, setShowTrialWelcome] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [permissionSettingsOpened, setPermissionSettingsOpened] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const mountedRef = useRef(true);

  // For App Store build, Accessibility UI is completely disabled
  const isAppStore = state.isAppStore ?? (!isWindows);

  // ── Header Badge Notification ────────────────────────────────────────────
  useEffect(() => {
    if (uiState === 'PAID') onStatusChange?.('pro');
    else if (uiState === 'TRIAL_ACTIVE') onStatusChange?.('trial');
    else onStatusChange?.('free');
  }, [uiState, onStatusChange]);

  // StoreKit's native transaction listener can confirm Pro before the purchase
  // command finishes returning to the WebView. Close upgrade modal on verified paid state.
  useEffect(() => {
    if (uiState === 'PAID' && showUpgradeModal) {
      setShowUpgradeModal(false);
      setPurchaseError(null);
      setPurchaseSuccessToast(true);
      setTimeout(() => {
        if (mountedRef.current) setPurchaseSuccessToast(false);
      }, 3000);
    }
  }, [uiState, showUpgradeModal]);

  // ── Load State from Rust ─────────────────────────────────────────────────
  const loadState = useCallback(async () => {
    try {
      const dto = await bridge.getProState();
      if (!mountedRef.current) return;
      const ui = derived(dto);
      setState(dto);
      setUiState(ui);
    } catch {
      if (mountedRef.current) {
        setState(FREE_STATE);
        setUiState('FREE');
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [bridge]);

  // ── Load StoreKit Product Metadata ───────────────────────────────────────
  const loadProduct = useCallback(async () => {
    try {
      const prod = await bridge.loadProProduct();
      if (mountedRef.current && prod) {
        setStoreProduct(prod);
      }
    } catch {
      if (mountedRef.current) {
        setStoreProduct(null);
      }
    }
  }, [bridge]);

  // ── Accessibility Check (Direct / Legacy builds only) ───────────────────
  const checkPostEventPermission = useCallback(async (delayMs = 0): Promise<boolean> => {
    if (isAppStore) return true; // App Store edition uses zero Accessibility permissions
    if (mountedRef.current) setIsCheckingAccess(true);
    try {
      if (delayMs > 0) await new Promise<void>(r => setTimeout(r, delayMs));
      if (!mountedRef.current) return false;
      const trusted = await bridge.checkPostEventPermission();
      if (mountedRef.current) {
        setHasAccessibility(trusted);
      }
      return trusted;
    } catch {
      if (mountedRef.current) setHasAccessibility(false);
      return false;
    } finally {
      if (mountedRef.current) setTimeout(() => setIsCheckingAccess(false), 150);
    }
  }, [bridge, isAppStore]);

  // ── Modal-Scoped Polling (Active ONLY when modal is shown in Direct build) ─
  useEffect(() => {
    if (isAppStore || !showAccessibilityModal) return;
    checkPostEventPermission(200);
    const interval = setInterval(() => {
      if (mountedRef.current) checkPostEventPermission(0);
    }, 1200);
    return () => clearInterval(interval);
  }, [showAccessibilityModal, checkPostEventPermission, isAppStore]);

  // ── Window Focus Listener for immediate permission check ─────────────────
  useEffect(() => {
    if (isAppStore || !showAccessibilityModal) return;
    const handleFocus = () => { checkPostEventPermission(400); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [showAccessibilityModal, checkPostEventPermission, isAppStore]);

  // ── Mount & Rust Event Listeners ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    loadState();
    loadProduct();
    if (!isAppStore) checkPostEventPermission(0);

    const unlisteners: (() => void)[] = [];

    listen<void>('show-post-event-onboarding', () => {
      if (!isAppStore && mountedRef.current) setShowAccessibilityModal(true);
    }).then(fn => unlisteners.push(fn));

    listen<void>('show-upgrade-modal', () => {
      if (mountedRef.current) {
        setShowUpgradeModal(true);
        loadProduct();
      }
    }).then(fn => unlisteners.push(fn));

    listen<{ remaining: number }>('inline-fix-succeeded', ({ payload }) => {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, trialCreditsRemaining: payload.remaining }));
        if (payload.remaining <= 0) {
          setUiState('TRIAL_EXHAUSTED');
        }
      }
    }).then(fn => unlisteners.push(fn));

    listen<void>('trial-exhausted', () => {
      if (!mountedRef.current) return;
      setState(prev => {
        const next = { ...prev, trialCreditsRemaining: 0 };
        setUiState('TRIAL_EXHAUSTED');
        return next;
      });
    }).then(fn => unlisteners.push(fn));

    listen<ProStateDto>('pro-state-changed', ({ payload }) => {
      if (!mountedRef.current) return;
      setState(payload);
      setUiState(derived(payload));
    }).then(fn => unlisteners.push(fn));

    return () => {
      mountedRef.current = false;
      unlisteners.forEach(fn => {
        try {
          if (typeof fn === 'function') fn();
        } catch (_) {}
      });
    };
  }, [loadState, loadProduct, checkPostEventPermission, isAppStore]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleConfirmTrial = useCallback(async () => {
    setShowTrialWelcome(false);
    try {
      await bridge.activateTrial();
      await bridge.setInlineFixPreference(true);
      const dto = await bridge.getProState();
      if (!mountedRef.current) return;
      setState(dto);
      setUiState(derived(dto));
      if (!isAppStore) {
        const trusted = await checkPostEventPermission(100);
        if (!trusted) setShowAccessibilityModal(true);
      }
    } catch {}
  }, [bridge, checkPostEventPermission, isAppStore]);

  const handleToggleInlineFix = useCallback(async (enabled: boolean) => {
    try {
      await bridge.setInlineFixPreference(enabled);
      setState(prev => ({ ...prev, inlineFixEnabled: enabled }));
    } catch {}
  }, [bridge]);

  const handleOpenAccessibility = useCallback(async () => {
    setPermissionSettingsOpened(true);
    await bridge.openPostEventSettings();
    setTimeout(() => { if (mountedRef.current) checkPostEventPermission(600); }, 1500);
  }, [bridge, checkPostEventPermission]);

  const handleRecheckPermission = useCallback(async () => {
    setIsCheckingAccess(true);
    try {
      await bridge.requestPostEventPermission();
      await checkPostEventPermission(350);
    } finally {
      if (mountedRef.current) setIsCheckingAccess(false);
    }
  }, [bridge, checkPostEventPermission]);

  // ── Real Purchase Handler ─────────────────────────────────────────────────
  const handlePurchase = useCallback(async () => {
    if (isPurchasing) return;
    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchasePending(false);

    try {
      const res = await bridge.purchasePro();
      if (!mountedRef.current) return;

      if (res.status === 'SUCCESS') {
        const entitlement = await bridge.getProEntitlement();
        if (entitlement.paid && entitlement.verificationStatus === 'VERIFIED') {
          await loadState();
          if (mountedRef.current) {
            setShowUpgradeModal(false);
            setPurchaseSuccessToast(true);
            onStatusChange?.('pro');
            setTimeout(() => {
              if (mountedRef.current) setPurchaseSuccessToast(false);
            }, 3000);
          }
        } else {
          setPurchaseError(t.purchaseFailed);
        }
      } else if (res.status === 'CANCELLED') {
        // User cancelled: silently return
      } else if (res.status === 'PENDING') {
        setPurchasePending(true);
      } else {
        setPurchaseError(t.purchaseFailed);
      }
    } catch {
      if (mountedRef.current) {
        setPurchaseError(t.purchaseFailed);
      }
    } finally {
      if (mountedRef.current) {
        setIsPurchasing(false);
      }
    }
  }, [bridge, isPurchasing, loadState, onStatusChange, t]);

  // ── Restore Purchases Handler ─────────────────────────────────────────────
  const handleRestore = useCallback(async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    setRestoreNotice(null);
    setPurchaseError(null);

    try {
      const res = await bridge.restorePurchases();
      if (!mountedRef.current) return;

      if (res.entitlement.paid && res.entitlement.verificationStatus === 'VERIFIED') {
        await loadState();
        if (mountedRef.current) {
          setShowUpgradeModal(false);
          setRestoreNotice({
            type: 'success',
            message: t.restoreSuccess,
          });
          onStatusChange?.('pro');
          setTimeout(() => {
            if (mountedRef.current) setRestoreNotice(null);
          }, 4000);
        }
      } else if (res.status === 'NOT_FOUND') {
        setRestoreNotice({
          type: 'info',
          message: t.restoreNotFound,
        });
      } else {
        setRestoreNotice({
          type: 'error',
          message: t.restoreFailed,
        });
      }
    } catch {
      if (mountedRef.current) {
        setRestoreNotice({
          type: 'error',
          message: t.restoreFailed,
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsRestoring(false);
      }
    }
  }, [bridge, isRestoring, loadState, onStatusChange, t]);

  // ── Loading Skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingRow}>
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} />
        </div>
      </div>
    );
  }

  const isProductAvailable = Boolean(storeProduct && storeProduct.isAvailable);
  const displayPriceText = storeProduct?.displayPrice ? ` • ${storeProduct.displayPrice}` : '';

  return (
    <div style={{ ...styles.container, direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Success Toast Banner */}
      {purchaseSuccessToast && (
        <div style={styles.successBanner} data-testid="purchase-success-toast">
          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
          <span style={{ color: '#10B981', fontWeight: 700, fontSize: 12 }}>{t.purchaseSuccess}</span>
        </div>
      )}

      {/* Restore Notice Toast / Banners */}
      {restoreNotice && restoreNotice.type === 'success' && (
        <div style={styles.successBanner} data-testid="restore-success-toast">
          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
          <span style={{ color: '#10B981', fontWeight: 700, fontSize: 12 }}>{restoreNotice.message}</span>
        </div>
      )}
      {restoreNotice && restoreNotice.type === 'info' && (
        <div style={styles.infoBanner} data-testid="restore-info-banner">
          <Info size={14} style={{ color: '#3B82F6', flexShrink: 0 }} />
          <span style={{ color: '#93C5FD', fontSize: 12, textAlign: 'center' }}>{restoreNotice.message}</span>
        </div>
      )}
      {restoreNotice && restoreNotice.type === 'error' && (
        <div style={styles.errorBanner} data-testid="restore-error-banner">
          <span>{restoreNotice.message}</span>
        </div>
      )}

      {/* ── 1. FREE STATE (Discoverability: Trial + Direct Purchase + Restore) ── */}
      {uiState === 'FREE' && (
        <div style={styles.row}>
          <button
            type="button"
            onClick={() => setShowTrialWelcome(true)}
            style={styles.trialBtn}
            title={isRTL ? 'بدء الفترة التجريبية' : 'Start free trial'}
            data-testid="start-trial-button"
          >
            <Sparkles size={13} />
            <span>{t.tryPro}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowUpgradeModal(true);
              loadProduct();
            }}
            style={styles.upgradeBtn}
            title={t.unlockPro}
            data-testid="unlock-pro-button-free"
          >
            <Lock size={13} />
            <span>{`${t.unlockPro}${displayPriceText}`}</span>
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            style={styles.restoreBtnMain}
            title={t.restoreBtn}
            data-testid="restore-purchases-button-main"
          >
            {isRestoring ? (
              <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <RotateCcw size={11} />
            )}
            <span>{isRestoring ? t.restoring : t.restoreBtn}</span>
          </button>
        </div>
      )}

      {/* ── 2. TRIAL ACTIVE STATE (Credits + Direct Purchase + Restore + Toggle) ─ */}
      {uiState === 'TRIAL_ACTIVE' && (
        <div style={styles.row}>
          {/* Credit Counter Badge */}
          <div
            style={styles.creditBadge}
            title={isRTL ? `المحاولات المتبقية: ${state.trialCreditsRemaining} من ${TOTAL_TRIAL_CREDITS}` : `${state.trialCreditsRemaining} of ${TOTAL_TRIAL_CREDITS} trial credits remaining`}
            data-testid="trial-credit-badge"
          >
            <Zap size={12} style={{ color: '#F59E0B' }} />
            <span style={styles.creditNum}>{state.trialCreditsRemaining}</span>
            <span style={styles.creditOf}>/{TOTAL_TRIAL_CREDITS}</span>
          </div>

          {/* Direct Pro Purchase button visible during trial */}
          <button
            type="button"
            onClick={() => {
              setShowUpgradeModal(true);
              loadProduct();
            }}
            style={styles.upgradeBtn}
            title={t.unlockPro}
            data-testid="unlock-pro-button-trial"
          >
            <Lock size={13} />
            <span>{`${t.unlockPro}${displayPriceText}`}</span>
          </button>

          {/* Restore Purchases Button accessible during trial */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            style={styles.restoreBtnMain}
            title={t.restoreBtn}
            data-testid="restore-purchases-button-trial"
          >
            {isRestoring ? (
              <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <RotateCcw size={11} />
            )}
            <span>{isRestoring ? t.restoring : t.restoreBtn}</span>
          </button>

          {/* Legacy Accessibility Indicator only on Direct / Windows build */}
          {!isAppStore && hasAccessibility === false && (
            <button
              onClick={() => setShowAccessibilityModal(true)}
              style={styles.warnBtn}
              title="Accessibility permission missing"
            >
              <ShieldAlert size={14} />
            </button>
          )}

          {/* Instant Fix Toggle */}
          <ToggleRow
            label={t.instantFix}
            enabled={state.inlineFixEnabled}
            onChange={handleToggleInlineFix}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* ── 3. TRIAL EXHAUSTED STATE (Direct Purchase + Restore) ───────── */}
      {uiState === 'TRIAL_EXHAUSTED' && (
        <div style={styles.row}>
          <button
            type="button"
            onClick={() => {
              setShowUpgradeModal(true);
              loadProduct();
            }}
            style={styles.upgradeBtn}
            data-testid="unlock-pro-button-exhausted"
          >
            <Lock size={13} />
            <span>{`${t.unlockPro}${displayPriceText}`}</span>
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            style={styles.restoreBtnMain}
            title={t.restoreBtn}
            data-testid="restore-purchases-button-exhausted"
          >
            {isRestoring ? (
              <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <RotateCcw size={11} />
            )}
            <span>{isRestoring ? t.restoring : t.restoreBtn}</span>
          </button>
        </div>
      )}

      {/* ── 4. PAID PRO STATE ────────────────────────────────────────── */}
      {uiState === 'PAID' && (
        <div style={styles.row}>
          {/* Legacy Accessibility Indicator only on Direct / Windows build */}
          {!isAppStore && hasAccessibility === false && (
            <button
              onClick={() => setShowAccessibilityModal(true)}
              style={styles.warnBtn}
              title="Accessibility permission required"
            >
              <ShieldAlert size={14} />
            </button>
          )}

          <ToggleRow
            label={t.instantFix}
            enabled={state.inlineFixEnabled}
            onChange={handleToggleInlineFix}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────── */}

      {/* 1. Trial Welcome Modal */}
      {showTrialWelcome && (
        <Modal onClose={() => setShowTrialWelcome(false)} isRTL={isRTL}>
          <div style={styles.modalIcon}>
            <Sparkles size={22} style={{ color: '#F59E0B' }} />
          </div>
          <h3 style={styles.modalTitle}>{t.trialTitle}</h3>
          <p style={styles.modalBody}>{t.trialDesc}</p>

          <div style={styles.featureList}>
            {[t.trialF1, t.trialF2, t.trialF3].map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <CheckCircle2 size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Compatibility & Fallback Note */}
          <div style={styles.compatNote}>
            <HelpCircle size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span>{t.compatNote}</span>
          </div>

          <button onClick={handleConfirmTrial} style={styles.primaryBtn} data-testid="confirm-trial-button">
            <span>{t.trialStart}</span>
            <ArrowRight size={13} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button onClick={() => setShowTrialWelcome(false)} style={styles.ghostBtn}>
            {t.trialLater}
          </button>
        </Modal>
      )}

      {/* 2. Legacy Accessibility Permission Modal (Direct / Windows only) */}
      {!isAppStore && showAccessibilityModal && (
        <Modal onClose={() => setShowAccessibilityModal(false)} isRTL={isRTL}>
          <div style={styles.modalIcon}>
            <ShieldCheck size={26} style={{ color: hasAccessibility ? '#10B981' : '#F59E0B' }} />
          </div>
          <h3 style={styles.modalTitle}>{t.axTitle}</h3>
          <p style={styles.modalBody}>{t.axDesc}</p>

          <ol style={styles.stepList}>
            {[t.axStep1, t.axStep2, t.axStep3, t.axStep4].map((s, i) => (
              <li key={i} style={styles.step}>
                <span style={styles.stepNum}>{i + 1}</span>
                <span style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>{s}</span>
              </li>
            ))}
          </ol>

          {hasAccessibility === true && (
            <div style={styles.successBanner}>
              <CheckCircle2 size={14} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: 12 }}>{t.axGranted}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {hasAccessibility === true ? (
              <button onClick={() => bridge.restartKeyFixer()} style={styles.primaryBtn}>
                <RefreshCw size={13} />
                <span>{isRTL ? 'إعادة تشغيل KeyFixer' : 'Restart KeyFixer'}</span>
              </button>
            ) : (
              <>
                <button onClick={handleOpenAccessibility} style={styles.primaryBtn}>
                  <ExternalLink size={13} />
                  <span>{t.axOpen}</span>
                </button>

                <button
                  onClick={handleRecheckPermission}
                  disabled={isCheckingAccess}
                  style={styles.secondaryBtn}
                >
                  {isCheckingAccess ? (
                    <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <ShieldCheck size={12} />
                  )}
                  <span>{isCheckingAccess ? t.axChecking : t.axCheck}</span>
                </button>

                {permissionSettingsOpened && (
                  <button onClick={() => bridge.restartKeyFixer()} style={styles.primaryBtn} data-testid="restart-after-permission-button">
                    <RefreshCw size={13} />
                    <span>{isRTL ? 'إعادة تشغيل KeyFixer لتطبيق الصلاحية' : 'Restart KeyFixer to apply permission'}</span>
                  </button>
                )}
              </>
            )}

            <button onClick={() => setShowAccessibilityModal(false)} style={styles.ghostBtn}>
              {t.axDone}
            </button>
          </div>
        </Modal>
      )}

      {/* 3. Upgrade / Purchase Modal */}
      {showUpgradeModal && (
        <Modal onClose={() => setShowUpgradeModal(false)} isRTL={isRTL}>
          <div style={styles.modalIcon}>
            <Lock size={22} style={{ color: '#F59E0B' }} />
          </div>
          <h3 style={styles.modalTitle}>{t.upgradeTitle}</h3>
          <p style={styles.modalBody}>{t.upgradeDesc}</p>

          <div style={styles.featureList}>
            {[t.upgradeF1, t.upgradeF2, t.upgradeF3].map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <CheckCircle2 size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Compatibility Note */}
          <div style={styles.compatNote}>
            <HelpCircle size={11} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span>{t.compatNote}</span>
          </div>

          {/* Pending Approval Notice */}
          {purchasePending && (
            <div style={styles.pendingBanner} data-testid="purchase-pending-banner">
              <span style={{ fontWeight: 700 }}>{t.purchasePending}</span>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.9 }}>{t.purchasePendingDesc}</p>
            </div>
          )}

          {/* Error Notice */}
          {purchaseError && (
            <div style={styles.errorBanner} data-testid="purchase-error-banner">
              <span>{purchaseError}</span>
            </div>
          )}

          {/* StoreKit Unavailable Notice */}
          {!isProductAvailable && (
            <div style={styles.unavailableBanner} data-testid="purchase-unavailable-banner">
              <span>{t.purchaseUnavailable}</span>
            </div>
          )}

          {/* Purchase Button */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isPurchasing || !isProductAvailable}
            style={{
              ...styles.primaryBtn,
              opacity: (isPurchasing || !isProductAvailable) ? 0.6 : 1,
              cursor: (isPurchasing || !isProductAvailable) ? 'not-allowed' : 'pointer',
            }}
            data-testid="purchase-pro-button"
          >
            {isPurchasing ? (
              <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Sparkles size={13} />
            )}
            <span>{isPurchasing ? (isRTL ? 'جارٍ الاتصال بـ App Store…' : (effectiveLang === 'de' ? 'Verbindung zum App Store…' : 'Connecting to App Store…')) : `${t.upgradeCta}${displayPriceText}`}</span>
          </button>

          {/* Restore Notice Banner inside Modal */}
          {restoreNotice && restoreNotice.type === 'info' && (
            <div style={styles.infoBanner} data-testid="restore-info-banner-modal">
              <span style={{ fontSize: 11, textAlign: 'center', color: '#93C5FD' }}>{restoreNotice.message}</span>
            </div>
          )}
          {restoreNotice && restoreNotice.type === 'error' && (
            <div style={styles.errorBanner} data-testid="restore-error-banner-modal">
              <span>{restoreNotice.message}</span>
            </div>
          )}

          {/* Restore Purchases Button in Upgrade Modal */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring || isPurchasing}
            style={styles.secondaryBtn}
            data-testid="restore-purchases-button-modal"
          >
            {isRestoring ? (
              <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <RotateCcw size={12} />
            )}
            <span>{isRestoring ? t.restoring : t.restoreBtn}</span>
          </button>

          <button onClick={() => setShowUpgradeModal(false)} style={styles.ghostBtn}>
            {t.upgradeNot}
          </button>

          {/* Small Secondary Legal Links */}
          <div style={styles.legalLinksRow}>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'terms' } }));
                onOpenLegal?.('terms');
              }}
              style={styles.legalLinkBtn}
            >
              {t.terms}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'privacy' } }));
                onOpenLegal?.('privacy');
              }}
              style={styles.legalLinkBtn}
            >
              {t.privacy}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'purchase-refund' } }));
                onOpenLegal?.('purchase-refund');
              }}
              style={styles.legalLinkBtn}
            >
              {t.refund}
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

// ── Toggle Switch Sub-Component ──────────────────────────────────────────────

function ToggleRow({
  label,
  enabled,
  onChange,
  isRTL
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  isRTL?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={styles.toggleLabel}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        style={{
          ...styles.toggle,
          background: enabled ? '#F59E0B' : 'rgba(255,255,255,0.18)',
        }}
        title={enabled ? (isRTL ? 'تعطيل التصحيح الفوري' : 'Disable Instant Fix') : (isRTL ? 'تفعيل التصحيح الفوري' : 'Enable Instant Fix')}
      >
        <div
          style={{
            ...styles.thumb,
            transform: enabled ? (isRTL ? 'translateX(-14px)' : 'translateX(14px)') : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}

// ── Modal Wrapper ────────────────────────────────────────────────────────────

function Modal({
  children,
  onClose,
  isRTL
}: {
  children: React.ReactNode;
  onClose: () => void;
  isRTL?: boolean;
}) {
  return (
    <div className="kf-modal-overlay" style={styles.overlay} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="kf-modal-card" style={styles.card}>
        <button
          onClick={onClose}
          style={{
            ...styles.closeBtn,
            [isRTL ? 'left' : 'right']: 12,
            [isRTL ? 'right' : 'left']: 'auto',
          }}
          title={isRTL ? 'إغلاق' : 'Close'}
        >
          <X size={14} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    padding: '2px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },

  // ── Buttons ──
  trialBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 8,
    border: '1px solid rgba(245, 158, 11, 0.45)',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  upgradeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 8,
    border: '1px solid rgba(245, 158, 11, 0.7)',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.25))',
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
  },
  warnBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#F59E0B',
    cursor: 'pointer',
    padding: 2,
  },
  okDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
  },

  // ── Credit Counter Badge ──
  creditBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 8,
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
  },
  creditNum: {
    fontSize: 12,
    fontWeight: 800,
    color: '#F59E0B',
    fontVariantNumeric: 'tabular-nums' as const,
  },
  creditOf: {
    fontSize: 10,
    color: 'rgba(245, 158, 11, 0.65)',
    fontVariantNumeric: 'tabular-nums' as const,
  },

  // ── Toggle Switch ──
  toggleLabel: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 600,
  },
  toggle: {
    width: 30,
    height: 18,
    borderRadius: 9,
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 0.2s',
    padding: 0,
    flexShrink: 0,
  },
  thumb: {
    position: 'absolute' as const,
    top: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    background: '#FFFFFF',
    transition: 'transform 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },

  // ── Modals & Overlay ──
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: 'linear-gradient(150deg, #1C1C28 0%, #151520 100%)',
    borderRadius: 16,
    padding: '24px 20px 18px',
    maxWidth: 350,
    width: '100%',
    position: 'relative' as const,
    border: '1px solid rgba(245, 158, 11, 0.25)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.65), 0 0 30px rgba(245,158,11,0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 7,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 10,
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    borderRadius: 6,
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  modalIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: -2,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: 800,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  modalBody: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 1.35,
    textAlign: 'center' as const,
    margin: 0,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 1.35,
  },
  compatNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    padding: '2px 0',
  },
  stepList: {
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    listStyle: 'none',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 7,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 1.4,
  },
  stepNum: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    background: 'rgba(245, 158, 11, 0.22)',
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '6px 10px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    borderRadius: 7,
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '6px 10px',
    background: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    borderRadius: 7,
  },
  pendingBanner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: '6px 10px',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: 7,
    color: '#F59E0B',
    textAlign: 'center' as const,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '6px 10px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: 7,
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 600,
    textAlign: 'center' as const,
  },
  unavailableBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 7,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    textAlign: 'center' as const,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#121212',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 3px 12px rgba(245, 158, 11, 0.3)',
    transition: 'transform 0.15s, opacity 0.15s',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
    padding: '6px 12px',
    borderRadius: 7,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  restoreBtnMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  ghostBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    cursor: 'pointer',
    textAlign: 'center' as const,
    padding: '2px 0',
  },
  legalLinksRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
    paddingTop: 4,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  legalLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
} as const;
