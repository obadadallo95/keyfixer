import { invoke } from '@tauri-apps/api/core';
import {
  ProRuntimeBridge,
  ProStateDto,
  StoreProduct,
  StoreEntitlement,
  PurchaseResult,
  RestorePurchasesResult,
  STOREKIT_PRODUCT_ID,
} from '../../src/pro/contracts';
import { ProPanel } from './ProPanel';

const FREE_STATE: ProStateDto = {
  mode: 'free',
  uiState: 'FREE',
  trialCreditsRemaining: 0,
  trialStarted: false,
  inlineFixEnabled: false,
};

const FallbackProduct: StoreProduct = {
  id: STOREKIT_PRODUCT_ID,
  displayName: 'KeyFixer Pro Lifetime',
  displayPrice: '',
  isAvailable: false,
};

const FallbackEntitlement: StoreEntitlement = {
  paid: false,
  productId: null,
  purchaseDate: null,
  revocationDate: null,
  verificationStatus: 'NOT_PURCHASED',
};

export const ProductionProBridge: ProRuntimeBridge = {
  async getProState(): Promise<ProStateDto> {
    try {
      return await invoke<ProStateDto>('get_pro_state');
    } catch {
      return FREE_STATE;
    }
  },

  async activateTrial(): Promise<boolean> {
    try {
      return await invoke<boolean>('activate_trial');
    } catch {
      return false;
    }
  },

  async setInlineFixPreference(enabled: boolean): Promise<void> {
    try {
      await invoke('set_inline_fix_preference', { enabled });
    } catch {}
  },

  async checkAccessibility(): Promise<boolean> {
    try {
      return await invoke<boolean>('check_accessibility');
    } catch {
      return true;
    }
  },

  async openAccessibilitySettings(): Promise<void> {
    try {
      await invoke('open_accessibility_settings');
    } catch {}
  },

  async submitConversionResponse(id: number, text: string): Promise<void> {
    try {
      await invoke('submit_conversion_response', { id, text });
    } catch {}
  },

  async loadProProduct(): Promise<StoreProduct | null> {
    try {
      return await invoke<StoreProduct>('storekit_load_pro_product');
    } catch {
      return FallbackProduct;
    }
  },

  async getProEntitlement(): Promise<StoreEntitlement> {
    try {
      return await invoke<StoreEntitlement>('storekit_get_pro_entitlement');
    } catch {
      return FallbackEntitlement;
    }
  },

  async purchasePro(): Promise<PurchaseResult> {
    try {
      return await invoke<PurchaseResult>('storekit_purchase_pro');
    } catch (e: any) {
      return { status: 'FAILED', errorMessage: String(e) };
    }
  },

  async restorePurchases(): Promise<RestorePurchasesResult> {
    try {
      return await invoke<RestorePurchasesResult>('storekit_restore_purchases');
    } catch {
      return { status: 'FAILED', entitlement: FallbackEntitlement, errorMessage: 'Restore failed' };
    }
  },
};

export const ProProvider = ProductionProBridge;
export { ProPanel };

