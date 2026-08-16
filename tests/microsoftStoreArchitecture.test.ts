import { describe, it, expect } from 'vitest';
import {
  StoreProduct,
  StoreEntitlement,
  PurchaseResult,
  RestorePurchasesResult,
} from '../src/pro/contracts';

// Constants matching Microsoft Partner Center & Rust Windows Pro Engine
export const MS_PARENT_STORE_ID = '9PK3G83GP41D';
export const MS_PRO_ADDON_STORE_ID = '9N98VZCQLDL7';
export const MS_PRO_ADDON_PRODUCT_ID = 'keyfixer.pro.lifetime';
export const MS_FALLBACK_PRICE = '€9.99';
export const MS_DEFAULT_DISPLAY_NAME = 'KeyFixer Pro Lifetime';

// WinRT StorePurchaseStatus Enum
export enum WinRTStorePurchaseStatus {
  Succeeded = 0,
  AlreadyPurchased = 1,
  NotPurchased = 2,
  NetworkError = 3,
  ServerError = 4,
  UnknownError = 5,
}

interface MockStoreLicense {
  storeId: string;
  inAppOfferToken: string;
  isActive: boolean;
}

export function normalizeMicrosoftStoreEntitlement(
  licenses: MockStoreLicense[]
): StoreEntitlement {
  const activeLicense = licenses.find(
    (lic) =>
      (lic.storeId === MS_PRO_ADDON_STORE_ID || lic.inAppOfferToken === MS_PRO_ADDON_PRODUCT_ID) &&
      lic.isActive
  );

  if (!activeLicense) {
    return {
      paid: false,
      productId: null,
      purchaseDate: null,
      revocationDate: null,
      verificationStatus: 'NOT_PURCHASED',
    };
  }

  return {
    paid: true,
    productId: activeLicense.inAppOfferToken || activeLicense.storeId,
    purchaseDate: '2026-08-16T12:00:00.000Z',
    revocationDate: null,
    verificationStatus: 'VERIFIED',
  };
}

export function processMicrosoftStorePurchase(
  status: WinRTStorePurchaseStatus,
  isElevated: boolean,
  currentLicenses: MockStoreLicense[],
  currentTrialCredits: number
): {
  result: PurchaseResult;
  entitlement: StoreEntitlement;
  credits: number;
} {
  if (isElevated) {
    return {
      result: {
        status: 'FAILED',
        errorMessage:
          'Purchases cannot be made from an elevated (Administrator) process. Please run KeyFixer as a standard user.',
      },
      entitlement: normalizeMicrosoftStoreEntitlement(currentLicenses),
      credits: currentTrialCredits,
    };
  }

  switch (status) {
    case WinRTStorePurchaseStatus.Succeeded:
    case WinRTStorePurchaseStatus.AlreadyPurchased: {
      const newLicenses = [
        ...currentLicenses,
        {
          storeId: MS_PRO_ADDON_STORE_ID,
          inAppOfferToken: MS_PRO_ADDON_PRODUCT_ID,
          isActive: true,
        },
      ];
      return {
        result: { status: 'SUCCESS' },
        entitlement: normalizeMicrosoftStoreEntitlement(newLicenses),
        credits: currentTrialCredits,
      };
    }
    case WinRTStorePurchaseStatus.NotPurchased: {
      return {
        result: { status: 'CANCELLED' },
        entitlement: normalizeMicrosoftStoreEntitlement(currentLicenses),
        credits: currentTrialCredits,
      };
    }
    case WinRTStorePurchaseStatus.NetworkError: {
      return {
        result: {
          status: 'FAILED',
          errorMessage:
            'A network error occurred while connecting to Microsoft Store. Please check your internet connection.',
        },
        entitlement: normalizeMicrosoftStoreEntitlement(currentLicenses),
        credits: currentTrialCredits,
      };
    }
    case WinRTStorePurchaseStatus.ServerError: {
      return {
        result: {
          status: 'FAILED',
          errorMessage: 'A Microsoft Store server error occurred. Please try again later.',
        },
        entitlement: normalizeMicrosoftStoreEntitlement(currentLicenses),
        credits: currentTrialCredits,
      };
    }
    default: {
      return {
        result: {
          status: 'FAILED',
          errorMessage: 'An unexpected error occurred during purchase.',
        },
        entitlement: normalizeMicrosoftStoreEntitlement(currentLicenses),
        credits: currentTrialCredits,
      };
    }
  }
}

export function processMicrosoftStoreRestore(
  licenses: MockStoreLicense[],
  networkAvailable: boolean
): RestorePurchasesResult {
  if (!networkAvailable) {
    return {
      status: 'FAILED',
      entitlement: {
        paid: false,
        productId: null,
        purchaseDate: null,
        revocationDate: null,
        verificationStatus: 'NOT_PURCHASED',
      },
      errorMessage: 'Could not connect to Microsoft Store to verify purchases.',
    };
  }

  const entitlement = normalizeMicrosoftStoreEntitlement(licenses);
  if (entitlement.paid) {
    return {
      status: 'RESTORED',
      entitlement,
    };
  }

  return {
    status: 'NOT_FOUND',
    entitlement,
  };
}

describe('Microsoft Store Durable Add-on Integration Architecture', () => {
  describe('1. Store Identifiers & Constants', () => {
    it('matches Microsoft Partner Center durable add-on IDs', () => {
      expect(MS_PARENT_STORE_ID).toBe('9PK3G83GP41D');
      expect(MS_PRO_ADDON_STORE_ID).toBe('9N98VZCQLDL7');
      expect(MS_PRO_ADDON_PRODUCT_ID).toBe('keyfixer.pro.lifetime');
      expect(MS_FALLBACK_PRICE).toBe('€9.99');
      expect(MS_DEFAULT_DISPLAY_NAME).toBe('KeyFixer Pro Lifetime');
    });
  });

  describe('2. Purchase Status Mapping & Elevation Security', () => {
    it('blocks purchase when running from elevated administrator process', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.Succeeded,
        true, // isElevated
        [],
        25
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.result.errorMessage).toContain('elevated');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.credits).toBe(25);
    });

    it('maps Succeeded purchase to SUCCESS and sets paid = true', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.Succeeded,
        false,
        [],
        10
      );
      expect(outcome.result.status).toBe('SUCCESS');
      expect(outcome.entitlement.paid).toBe(true);
      expect(outcome.entitlement.verificationStatus).toBe('VERIFIED');
      expect(outcome.credits).toBe(10);
    });

    it('maps AlreadyPurchased to SUCCESS and sets paid = true', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.AlreadyPurchased,
        false,
        [],
        0
      );
      expect(outcome.result.status).toBe('SUCCESS');
      expect(outcome.entitlement.paid).toBe(true);
      expect(outcome.entitlement.verificationStatus).toBe('VERIFIED');
    });

    it('maps NotPurchased to CANCELLED without changing state or trial credits', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.NotPurchased,
        false,
        [],
        18
      );
      expect(outcome.result.status).toBe('CANCELLED');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.credits).toBe(18);
    });

    it('maps NetworkError to FAILED with appropriate error message', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.NetworkError,
        false,
        [],
        5
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.result.errorMessage).toContain('network error');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.credits).toBe(5);
    });

    it('maps ServerError to FAILED with appropriate error message', () => {
      const outcome = processMicrosoftStorePurchase(
        WinRTStorePurchaseStatus.ServerError,
        false,
        [],
        5
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.result.errorMessage).toContain('server error');
      expect(outcome.entitlement.paid).toBe(false);
    });
  });

  describe('3. Entitlement & License Verification', () => {
    it('grants paid entitlement when storeId 9N98VZCQLDL7 is active', () => {
      const entitlement = normalizeMicrosoftStoreEntitlement([
        {
          storeId: '9N98VZCQLDL7',
          inAppOfferToken: '',
          isActive: true,
        },
      ]);
      expect(entitlement.paid).toBe(true);
      expect(entitlement.verificationStatus).toBe('VERIFIED');
    });

    it('grants paid entitlement when inAppOfferToken keyfixer.pro.lifetime is active', () => {
      const entitlement = normalizeMicrosoftStoreEntitlement([
        {
          storeId: 'SOME_TEMP_ID',
          inAppOfferToken: 'keyfixer.pro.lifetime',
          isActive: true,
        },
      ]);
      expect(entitlement.paid).toBe(true);
      expect(entitlement.productId).toBe('keyfixer.pro.lifetime');
      expect(entitlement.verificationStatus).toBe('VERIFIED');
    });

    it('denies paid entitlement when license isActive is false', () => {
      const entitlement = normalizeMicrosoftStoreEntitlement([
        {
          storeId: '9N98VZCQLDL7',
          inAppOfferToken: 'keyfixer.pro.lifetime',
          isActive: false,
        },
      ]);
      expect(entitlement.paid).toBe(false);
      expect(entitlement.verificationStatus).toBe('NOT_PURCHASED');
    });

    it('denies paid entitlement when no matching add-on license is found', () => {
      const entitlement = normalizeMicrosoftStoreEntitlement([
        {
          storeId: 'OTHER_ADDON_123',
          inAppOfferToken: 'other.product',
          isActive: true,
        },
      ]);
      expect(entitlement.paid).toBe(false);
      expect(entitlement.verificationStatus).toBe('NOT_PURCHASED');
    });
  });

  describe('4. Restore Purchases Flow', () => {
    it('restores active Microsoft Store purchase successfully', () => {
      const result = processMicrosoftStoreRestore(
        [
          {
            storeId: '9N98VZCQLDL7',
            inAppOfferToken: 'keyfixer.pro.lifetime',
            isActive: true,
          },
        ],
        true
      );
      expect(result.status).toBe('RESTORED');
      expect(result.entitlement.paid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns NOT_FOUND when user has no active Store purchase', () => {
      const result = processMicrosoftStoreRestore([], true);
      expect(result.status).toBe('NOT_FOUND');
      expect(result.entitlement.paid).toBe(false);
    });

    it('returns FAILED when network is unavailable during restore', () => {
      const result = processMicrosoftStoreRestore([], false);
      expect(result.status).toBe('FAILED');
      expect(result.entitlement.paid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
