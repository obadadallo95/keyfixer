import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProPanelProps, ProStateDto, UiState } from '../../src/pro/contracts';
import { invoke } from '@tauri-apps/api/core';
import {
  Zap, Lock, CheckCircle2, ShieldAlert, ShieldCheck, Sparkles,
  X, Loader2, ArrowRight, RotateCcw, ExternalLink, RefreshCw, Info
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
};

// ── i18n Translations ─────────────────────────────────────────────────────────

const T = {
  en: {
    tryPro: 'Try Pro Free',
    unlockPro: 'Unlock Pro',
    inlineFix: 'Inline Fix',
    resetTest: '↺ Recharge (25)',
    resetFree: '↺ Fresh Free',
    rechargeSuccess: 'Recharged 25 credits!',
    // Accessibility modal
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
    // Trial modal
    trialTitle: 'Try KeyFixer Pro',
    trialDesc: 'Enjoy 25 free instant Inline Fixes — select mistyped text in any application and press ⌥⌘K to convert it instantly.',
    trialF1: 'Fix text instantly inside any application',
    trialF2: 'No copy-pasting or switching windows needed',
    trialF3: 'Works system-wide seamlessly on macOS',
    trialStart: 'Start Free Trial (25 Fixes)',
    trialLater: 'Maybe Later',
    // Upgrade modal
    upgradeTitle: 'Trial Ended',
    upgradeDesc: 'You have used all 25 trial credits. Upgrade to KeyFixer Pro for unlimited system-wide inline fixes.',
    upgradeF1: 'Unlimited Inline Fixes with ⌥⌘K',
    upgradeF2: 'Works across all apps and browsers',
    upgradeF3: 'One-time license with lifetime updates',
    upgradeF4: 'All correction happens locally on your Mac',
    upgradeF5: 'Your selected text is never uploaded or stored',
    upgradeCta: 'Get KeyFixer Pro',
    upgradeNot: 'Not Now',
    // Purchase states & messages (TASK 9B)
    purchaseUnavailable: 'Purchase temporarily unavailable',
    purchasePending: 'Purchase pending approval',
    purchasePendingDesc: 'Your purchase is pending approval with Apple. KeyFixer Pro will unlock automatically once confirmed.',
    purchaseFailed: "Purchase couldn't be completed. Please try again.",
    purchaseSuccess: 'KeyFixer Pro unlocked',
    // Restore Purchases messages (TASK 9C)
    restoreBtn: 'Restore Purchases',
    restoring: 'Restoring…',
    restoreSuccess: 'KeyFixer Pro restored',
    restoreNotFound: 'No KeyFixer Pro purchase was found for this Apple Account.',
    restoreFailed: "Couldn't restore purchases. Please try again.",
  },
  ar: {
    tryPro: '✨ تجربة Pro مجاناً',
    unlockPro: 'الترقية إلى Pro',
    inlineFix: 'التصحيح المباشر',
    resetTest: '↺ شحن (25)',
    resetFree: '↺ إعادة ضبط البداية',
    rechargeSuccess: 'تم شحن 25 محاولة!',
    // Accessibility modal
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
    // Trial modal
    trialTitle: 'جرّب KeyFixer Pro',
    trialDesc: 'احصل على 25 محاولة تصحيح مجانية — حدد أي نص مكتوب باللغة الخاطئة واضغط ⌥⌘K ليتم تصحيحه مكانه فوراً في أي برنامج.',
    trialF1: 'تصحيح مباشر وفوري داخل أي برنامج أو محرر',
    trialF2: 'بدون الحاجة لنسخ أو لصق أو تبديل النوافذ',
    trialF3: 'يعمل على مستوى نظام macOS بالكامل',
    trialStart: 'ابدأ التجربة المجانية (25 محاولة)',
    trialLater: 'ربما لاحقاً',
    // Upgrade modal
    upgradeTitle: 'انتهت المحاولات التجريبية',
    upgradeDesc: 'لقد استهلكت 25 محاولة تجريبية بنجاح. قم بالترقية إلى KeyFixer Pro للاستمتاع بتصحيح غير محدود.',
    upgradeF1: 'تصحيح فوري غير محدود باختصار ⌥⌘K',
    upgradeF2: 'يعمل في جميع التطبيقات والمتصفحات',
    upgradeF3: 'شراء مرة واحدة مع تحديثات مستقبلية',
    upgradeF4: 'تتم معالجة النص محلياً على جهازك',
    upgradeF5: 'لا يتم رفع النص المحدد أو تخزينه',
    upgradeCta: 'الترقية إلى KeyFixer Pro',
    upgradeNot: 'ليس الآن',
    // Purchase states & messages (TASK 9B)
    purchaseUnavailable: 'الشراء غير متاح مؤقتًا',
    purchasePending: 'عملية الشراء بانتظار الموافقة',
    purchasePendingDesc: 'عملية الشراء بانتظار موافقة Apple. سيتم تفعيل KeyFixer Pro تلقائيًا فور تأكيدها.',
    purchaseFailed: 'تعذر إكمال عملية الشراء. حاول مرة أخرى.',
    purchaseSuccess: 'تم تفعيل KeyFixer Pro',
    // Restore Purchases messages (TASK 9C)
    restoreBtn: 'استعادة المشتريات',
    restoring: 'جارٍ الاستعادة…',
    restoreSuccess: 'تمت استعادة KeyFixer Pro',
    restoreNotFound: 'لم يتم العثور على شراء KeyFixer Pro مرتبط بحساب Apple هذا.',
    restoreFailed: 'تعذر استعادة المشتريات. حاول مرة أخرى.',
  },
};

// ── Helper: Derive UI State ──────────────────────────────────────────────────

function derived(dto: ProStateDto): UiState {
  if (dto.mode === 'paid') return 'PAID';
  if (dto.mode === 'trial' && dto.trialCreditsRemaining > 0) return 'TRIAL_ACTIVE';
  if (dto.mode === 'trial') return 'TRIAL_EXHAUSTED';
  return 'FREE';
}

// ── Main ProPanel Component ──────────────────────────────────────────────────

export function ProPanel({ bridge, isRTL, onStatusChange, onOpenLegal }: ProPanelProps) {
  const t = isRTL ? T.ar : T.en;

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

  // Restore Purchases State (TASK 9C)
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const [showTrialWelcome, setShowTrialWelcome] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [permissionSettingsOpened, setPermissionSettingsOpened] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const mountedRef = useRef(true);

  // ── Header Badge Notification ────────────────────────────────────────────
  useEffect(() => {
    if (uiState === 'PAID') onStatusChange?.('pro');
    else if (uiState === 'TRIAL_ACTIVE') onStatusChange?.('trial');
    else onStatusChange?.('free');
  }, [uiState, onStatusChange]);

  // StoreKit's native transaction listener can confirm Pro before the purchase
  // command finishes returning to the WebView. Close the upgrade modal as soon
  // as that verified paid state arrives instead of leaving the user waiting.
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

  // ── Accessibility Check ──────────────────────────────────────────────────
  const checkPostEventPermission = useCallback(async (delayMs = 0): Promise<boolean> => {
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
  }, [bridge]);

  // ── Modal-Scoped Polling (Active ONLY when modal is shown) ────────────────
  useEffect(() => {
    if (!showAccessibilityModal) return;
    checkPostEventPermission(200);
    const interval = setInterval(() => {
      if (mountedRef.current) checkPostEventPermission(0);
    }, 1200);
    return () => clearInterval(interval);
  }, [showAccessibilityModal, checkPostEventPermission]);

  // ── Window Focus Listener for immediate permission check ─────────────────
  useEffect(() => {
    if (!showAccessibilityModal) return;
    const handleFocus = () => { checkPostEventPermission(400); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [showAccessibilityModal, checkPostEventPermission]);

  // ── Mount & Rust Event Listeners ──────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    loadState();
    loadProduct();
    checkPostEventPermission(0);

    const unlisteners: (() => void)[] = [];

    listen<void>('show-post-event-onboarding', () => {
      if (mountedRef.current) setShowAccessibilityModal(true);
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
  }, [loadState, loadProduct, checkPostEventPermission]);

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
      const trusted = await checkPostEventPermission(100);
      if (!trusted) setShowAccessibilityModal(true);
    } catch {}
  }, [bridge, checkPostEventPermission]);

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

  // ── Real Purchase Handler (TASK 9B) ───────────────────────────────────────
  const handlePurchase = useCallback(async () => {
    if (isPurchasing) return; // Prevent double-clicks / repeated invocations
    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchasePending(false);

    try {
      const res = await bridge.purchasePro();
      if (!mountedRef.current) return;

      if (res.status === 'SUCCESS') {
        // Entitlement Verification: Always reconcile with StoreKit verified entitlement
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
        // User cancelled: no error, no trial change, reset CTA state
      } else if (res.status === 'PENDING') {
        // StoreKit pending approval
        setPurchasePending(true);
      } else {
        // Genuine purchase failure
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

  // ── Restore Purchases Handler (TASK 9C / 9C.1) ─────────────────────────────
  const handleRestore = useCallback(async () => {
    if (isRestoring) return; // Prevent duplicate restore calls
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

      {/* ── 1. FREE STATE ───────────────────────────────────────────── */}
      {uiState === 'FREE' && (
        <div style={styles.row}>
          <button
            onClick={() => setShowTrialWelcome(true)}
            style={styles.trialBtn}
            title={isRTL ? 'انقر لتفعيل الفترة التجريبية' : 'Click to start free trial'}
          >
            <Sparkles size={13} />
            <span>{t.tryPro}</span>
          </button>

          <button
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

      {/* ── 2. TRIAL ACTIVE STATE ────────────────────────────────────── */}
      {uiState === 'TRIAL_ACTIVE' && (
        <div style={styles.row}>
          {/* Credit Counter Badge */}
          <div
            style={styles.creditBadge}
            title={isRTL ? `المحاولات المتبقية: ${state.trialCreditsRemaining} من ${TOTAL_TRIAL_CREDITS}` : `${state.trialCreditsRemaining} of ${TOTAL_TRIAL_CREDITS} trial credits remaining`}
          >
            <Zap size={12} style={{ color: '#F59E0B' }} />
            <span style={styles.creditNum}>{state.trialCreditsRemaining}</span>
            <span style={styles.creditOf}>/{TOTAL_TRIAL_CREDITS}</span>
          </div>

          {/* Accessibility Indicator Button */}
          {hasAccessibility === false && (
            <button
              onClick={() => setShowAccessibilityModal(true)}
              style={styles.warnBtn}
              title={isRTL ? 'إذن تسهيلات الاستخدام غير مفعّل (انقر للتفعيل)' : 'Accessibility permission missing (click to grant)'}
            >
              <ShieldAlert size={14} />
            </button>
          )}
          {hasAccessibility === true && (
            <div
              style={styles.okDot}
              title={isRTL ? 'الصلاحيات مكتملة وجاهزة' : 'Accessibility permission active'}
            />
          )}

          {/* Inline Fix Toggle */}
          <ToggleRow
            label={t.inlineFix}
            enabled={state.inlineFixEnabled}
            onChange={handleToggleInlineFix}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* ── 3. TRIAL EXHAUSTED STATE ─────────────────────────────────── */}
      {uiState === 'TRIAL_EXHAUSTED' && (
        <div style={styles.row}>
          <button
            onClick={() => {
              setShowUpgradeModal(true);
              loadProduct();
            }}
            style={styles.upgradeBtn}
          >
            <Lock size={13} />
            <span>{t.unlockPro}</span>
          </button>

          {/* Restore Purchases Button (Available regardless of trial state) */}
          <button
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
          {hasAccessibility === false && (
            <button
              onClick={() => setShowAccessibilityModal(true)}
              style={styles.warnBtn}
              title={isRTL ? 'إذن تسهيلات الاستخدام غير مفعّل' : 'Accessibility permission required'}
            >
              <ShieldAlert size={14} />
            </button>
          )}
          {hasAccessibility === true && (
            <div style={styles.okDot} title={isRTL ? 'جاهز ومفعّل' : 'Pro Ready'} />
          )}

          <ToggleRow
            label={t.inlineFix}
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
            <Sparkles size={28} style={{ color: '#F59E0B' }} />
          </div>
          <h3 style={styles.modalTitle}>{t.trialTitle}</h3>
          <p style={styles.modalBody}>{t.trialDesc}</p>

          <div style={styles.featureList}>
            {[t.trialF1, t.trialF2, t.trialF3].map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <CheckCircle2 size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <button onClick={handleConfirmTrial} style={styles.primaryBtn}>
            <span>{t.trialStart}</span>
            <ArrowRight size={14} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button onClick={() => setShowTrialWelcome(false)} style={styles.ghostBtn}>
            {t.trialLater}
          </button>
        </Modal>
      )}

      {/* 2. Accessibility Permission Modal */}
      {showAccessibilityModal && (
        <Modal onClose={() => setShowAccessibilityModal(false)} isRTL={isRTL}>
          <div style={styles.modalIcon}>
            <ShieldCheck size={30} style={{ color: hasAccessibility ? '#10B981' : '#F59E0B' }} />
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

          {/* Success Banner if already granted */}
          {hasAccessibility === true && (
            <div style={styles.successBanner}>
              <CheckCircle2 size={15} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: 12.5 }}>{t.axGranted}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {hasAccessibility === true ? (
              <button onClick={() => bridge.restartKeyFixer()} style={styles.primaryBtn}>
                <RefreshCw size={14} />
                <span>{isRTL ? 'إعادة تشغيل KeyFixer' : 'Restart KeyFixer'}</span>
              </button>
            ) : (
              <>
                <button onClick={handleOpenAccessibility} style={styles.primaryBtn}>
                  <ExternalLink size={14} />
                  <span>{t.axOpen}</span>
                </button>

                <button
                  onClick={handleRecheckPermission}
                  disabled={isCheckingAccess}
                  style={styles.secondaryBtn}
                >
                  {isCheckingAccess ? (
                    <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <ShieldCheck size={13} />
                  )}
                  <span>{isCheckingAccess ? t.axChecking : t.axCheck}</span>
                </button>

                {permissionSettingsOpened && (
                  <button onClick={() => bridge.restartKeyFixer()} style={styles.primaryBtn} data-testid="restart-after-permission-button">
                    <RefreshCw size={14} />
                    <span>{isRTL ? 'إعادة تشغيل KeyFixer لتطبيق الصلاحية' : 'Restart KeyFixer to apply permission'}</span>
                  </button>
                )}
              </>
            )}

            {/* Small Link for Accessibility Disclosure */}
            <div style={{ marginTop: 2, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAccessibilityModal(false);
                  window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'accessibility' } }));
                  onOpenLegal?.('accessibility');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F59E0B',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 8px',
                  opacity: 0.9,
                }}
              >
                {isRTL ? 'لماذا يحتاج التطبيق إلى هذا الإذن؟' : 'Why is this permission needed?'}
              </button>
            </div>

            <button
              onClick={() => setShowAccessibilityModal(false)}
              style={styles.ghostBtn}
            >
              {t.axDone}
            </button>
          </div>
        </Modal>
      )}

      {/* 3. Upgrade Modal (TASK 9B Real StoreKit Purchase Flow) */}
      {showUpgradeModal && (
        <Modal onClose={() => setShowUpgradeModal(false)} isRTL={isRTL}>
          <div style={styles.modalIcon}>
            <Lock size={28} style={{ color: '#F59E0B' }} />
          </div>
          <h3 style={styles.modalTitle}>{t.upgradeTitle}</h3>
          <p style={styles.modalBody}>{t.upgradeDesc}</p>

          <div style={styles.featureList}>
            {[t.upgradeF1, t.upgradeF2, t.upgradeF3, t.upgradeF4, t.upgradeF5].map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <CheckCircle2 size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
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

          {/* Real Purchase Button */}
          <button
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
              <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Sparkles size={14} />
            )}
            <span>{isPurchasing ? (isRTL ? 'جارٍ الاتصال بـ App Store…' : 'Connecting to App Store…') : `${t.upgradeCta}${displayPriceText}`}</span>
          </button>

          {/* Restore Notice Banner inside Modal */}
          {restoreNotice && restoreNotice.type === 'info' && (
            <div style={styles.infoBanner} data-testid="restore-info-banner-modal">
              <span style={{ fontSize: 11.5, textAlign: 'center', color: '#93C5FD' }}>{restoreNotice.message}</span>
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
              <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <RotateCcw size={13} />
            )}
            <span>{isRestoring ? t.restoring : t.restoreBtn}</span>
          </button>

          <button onClick={() => setShowUpgradeModal(false)} style={styles.ghostBtn}>
            {t.upgradeNot}
          </button>

          {/* Small Secondary Legal Links below the purchase area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'terms' } }));
                onOpenLegal?.('terms');
              }}
              style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {isRTL ? 'الشروط' : 'Terms'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'privacy' } }));
                onOpenLegal?.('privacy');
              }}
              style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {isRTL ? 'الخصوصية' : 'Privacy'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(false);
                window.dispatchEvent(new CustomEvent('open-legal-doc', { detail: { doc: 'purchase-refund' } }));
                onOpenLegal?.('purchase-refund');
              }}
              style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {isRTL ? 'الشراء والاسترجاع' : 'Purchase & Refund'}
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
        title={enabled ? (isRTL ? 'تعطيل التصحيح المباشر' : 'Disable Inline Fix') : (isRTL ? 'تفعيل التصحيح المباشر' : 'Enable Inline Fix')}
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
    gap: 8,
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
    padding: '5px 12px',
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
    padding: '5px 12px',
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
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // ── Credit Counter Badge ──
  creditBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 9px',
    borderRadius: 8,
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
  },
  creditNum: {
    fontSize: 12.5,
    fontWeight: 800,
    color: '#F59E0B',
    fontVariantNumeric: 'tabular-nums' as const,
  },
  creditOf: {
    fontSize: 10.5,
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
    padding: '26px 22px 20px',
    maxWidth: 340,
    width: '100%',
    position: 'relative' as const,
    border: '1px solid rgba(245, 158, 11, 0.25)',
    boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(245,158,11,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 12,
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    borderRadius: 6,
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    padding: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  modalIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: 800,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  modalBody: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.55,
    textAlign: 'center' as const,
    margin: 0,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    padding: '9px 12px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  stepList: {
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    listStyle: 'none',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 1.45,
  },
  stepNum: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    background: 'rgba(245, 158, 11, 0.22)',
    color: '#F59E0B',
    fontSize: 10.5,
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
    gap: 7,
    padding: '8px 12px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    borderRadius: 8,
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '8px 12px',
    background: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    borderRadius: 8,
  },
  pendingBanner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '8px 12px',
    background: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.35)',
    borderRadius: 8,
    color: '#F59E0B',
    textAlign: 'center' as const,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 12px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: 8,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center' as const,
  },
  unavailableBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11.5,
    textAlign: 'center' as const,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    color: '#121212',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
    transition: 'transform 0.15s, opacity 0.15s',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '8px 14px',
    borderRadius: 9,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
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
    fontSize: 11.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  ghostBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'center' as const,
    padding: '4px 0',
  },
} as const;
