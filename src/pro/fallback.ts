import {
  ProRuntimeBridge,
  ProStateDto,
  StoreProduct,
  StoreEntitlement,
  PurchaseResult,
  RestorePurchasesResult,
  STOREKIT_PRODUCT_ID,
} from './contracts';

export const FREE_STATE: ProStateDto = {
  mode: 'free',
  uiState: 'FREE',
  trialCreditsRemaining: 0,
  trialStarted: false,
  inlineFixEnabled: false,
};

export const FallbackProduct: StoreProduct = {
  id: STOREKIT_PRODUCT_ID,
  displayName: 'KeyFixer Pro Lifetime',
  displayPrice: '',
  isAvailable: false,
};

export const FallbackEntitlement: StoreEntitlement = {
  paid: false,
  productId: null,
  purchaseDate: null,
  revocationDate: null,
  verificationStatus: 'NOT_PURCHASED',
};

/** Used in non-Pro builds or fallback mode. All operations are safe no-ops. */
export const FreeProBridge: ProRuntimeBridge = {
  async getProState() { return FREE_STATE; },
  async activateTrial() { return false; },
  async setInlineFixPreference(_enabled: boolean) {},
  async checkPostEventPermission() { return true; },
  async requestPostEventPermission() { return true; },
  async openPostEventSettings() {},
  async restartKeyFixer() {},
  async submitConversionResponse(_id: number, _text: string) {},
  async loadProProduct() { return FallbackProduct; },
  async getProEntitlement() { return FallbackEntitlement; },
  async purchasePro(): Promise<PurchaseResult> {
    return { status: 'FAILED', errorMessage: 'StoreKit not available in this configuration' };
  },
  async restorePurchases(): Promise<RestorePurchasesResult> {
    return { status: 'NOT_FOUND', entitlement: FallbackEntitlement };
  },
};
