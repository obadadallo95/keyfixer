// ── Entitlement / UI state ────────────────────────────────────────────────────

/** Persisted entitlement. Never "exhausted" — that is derived. */
export type ProMode = 'free' | 'trial' | 'paid';

/**
 * Derived UI state exposed to components.
 * TRIAL_EXHAUSTED = mode === 'trial' && trialCreditsRemaining === 0
 */
export type UiState = 'FREE' | 'TRIAL_ACTIVE' | 'TRIAL_EXHAUSTED' | 'PAID';

// ── DTO (matches Rust ProStateDto) ────────────────────────────────────────────

export interface ProStateDto {
  mode: ProMode;
  uiState: UiState;
  trialCreditsRemaining: number;
  trialStarted: boolean;
  /** User preference — independent of entitlement */
  inlineFixEnabled: boolean;
}

// ── StoreKit 2 Normalized Models ──────────────────────────────────────────────

export const STOREKIT_PRODUCT_ID = 'com.obadadallo.keyfixer.pro.lifetime';

export interface StoreProduct {
  id: string;
  displayName: string;
  displayPrice: string;
  isAvailable: boolean;
}

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'REVOKED' | 'NOT_PURCHASED' | 'MISSING';

export interface StoreEntitlement {
  paid: boolean;
  productId: string | null;
  purchaseDate: string | null;
  revocationDate: string | null;
  verificationStatus: VerificationStatus;
}

export type PurchaseStatus = 'SUCCESS' | 'CANCELLED' | 'PENDING' | 'FAILED';

export interface PurchaseResult {
  status: PurchaseStatus;
  errorMessage?: string;
}

export type RestoreStatus = 'RESTORED' | 'NOT_FOUND' | 'FAILED';

export interface RestorePurchasesResult {
  status: RestoreStatus;
  entitlement: StoreEntitlement;
  errorMessage?: string;
}

// ── Runtime Bridge ────────────────────────────────────────────────────────────

export interface ProRuntimeBridge {
  /** Get full Pro state snapshot from Rust */
  getProState(): Promise<ProStateDto>;

  /** Activate trial (free → trial). Idempotent. */
  activateTrial(): Promise<boolean>;

  /**
   * Set inline fix user preference.
   * Independent of entitlement — a PAID user may turn this off.
   */
  setInlineFixPreference(enabled: boolean): Promise<void>;

  /** Check macOS Accessibility permission */
  checkAccessibility(): Promise<boolean>;

  /** Open macOS Accessibility Settings */
  openAccessibilitySettings(): Promise<void>;

  /** Submit conversion result back to Rust inline fix pipeline */
  submitConversionResponse(id: number, text: string): Promise<void>;

  // ── StoreKit 2 Native Foundation ─────────────────────────────────────────────

  /** Load StoreKit product metadata from Apple */
  loadProProduct(): Promise<StoreProduct | null>;

  /** Query current StoreKit 2 verified entitlement */
  getProEntitlement(): Promise<StoreEntitlement>;

  /** Native purchase foundation stub for KeyFixer Pro Lifetime */
  purchasePro(): Promise<PurchaseResult>;

  /** Native restore foundation calling AppStore.sync() */
  restorePurchases(): Promise<RestorePurchasesResult>;
}

// ── Component Props ───────────────────────────────────────────────────────────

export interface ProPanelProps {
  bridge: ProRuntimeBridge;
  isRTL: boolean;
  /** Called when the effective Pro status changes for the header badge */
  onStatusChange?: (status: 'pro' | 'trial' | 'free') => void;
  /** Open a legal document in the legal viewer modal */
  onOpenLegal?: (doc: 'privacy' | 'terms' | 'purchase-refund' | 'impressum' | 'accessibility') => void;
}

