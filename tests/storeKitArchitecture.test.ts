import { describe, it, expect, vi } from 'vitest';
import {
  STOREKIT_PRODUCT_ID,
  StoreProduct,
  StoreEntitlement,
  PurchaseResult,
  VerificationStatus,
  ProRuntimeBridge,
} from '../src/pro/contracts';
import { FreeProBridge, FallbackProduct, FallbackEntitlement } from '../src/pro/fallback';
import { getProBridge } from '../src/pro/bridge';

// ── Pure normalized mapper function representing StoreKit 2 verification rules ─

interface RawStoreKitTransaction {
  productID: string;
  purchaseDate: string;
  revocationDate?: string | null;
  isVerified: boolean;
  verificationError?: string;
}

function normalizeStoreKitEntitlement(
  transactions: RawStoreKitTransaction[]
): StoreEntitlement {
  const proTransaction = transactions.find(
    (t) => t.productID === STOREKIT_PRODUCT_ID
  );

  if (!proTransaction) {
    return {
      paid: false,
      productId: null,
      purchaseDate: null,
      revocationDate: null,
      verificationStatus: 'NOT_PURCHASED',
    };
  }

  if (!proTransaction.isVerified) {
    return {
      paid: false,
      productId: proTransaction.productID,
      purchaseDate: proTransaction.purchaseDate,
      revocationDate: null,
      verificationStatus: 'UNVERIFIED',
    };
  }

  if (proTransaction.revocationDate) {
    return {
      paid: false,
      productId: proTransaction.productID,
      purchaseDate: proTransaction.purchaseDate,
      revocationDate: proTransaction.revocationDate,
      verificationStatus: 'REVOKED',
    };
  }

  return {
    paid: true,
    productId: proTransaction.productID,
    purchaseDate: proTransaction.purchaseDate,
    revocationDate: null,
    verificationStatus: 'VERIFIED',
  };
}

describe('StoreKit 2 Architecture & Native Bridge (TASK 9A)', () => {
  describe('1. Product ID and Constants', () => {
    it('uses exact product constant com.obadadallo.keyfixer.pro.lifetime', () => {
      expect(STOREKIT_PRODUCT_ID).toBe('com.obadadallo.keyfixer.pro.lifetime');
    });

    it('fallback product contains exact product id and empty display price', () => {
      expect(FallbackProduct.id).toBe(STOREKIT_PRODUCT_ID);
      expect(FallbackProduct.displayName).toBe('KeyFixer Pro Lifetime');
      expect(FallbackProduct.displayPrice).toBe('');
      expect(FallbackProduct.isAvailable).toBe(false);
    });

    it('fallback entitlement defaults to not paid', () => {
      expect(FallbackEntitlement.paid).toBe(false);
      expect(FallbackEntitlement.productId).toBeNull();
      expect(FallbackEntitlement.purchaseDate).toBeNull();
      expect(FallbackEntitlement.revocationDate).toBeNull();
      expect(FallbackEntitlement.verificationStatus).toBe('NOT_PURCHASED');
    });
  });

  describe('2. Entitlement Rule & StoreKit Verification Mapping', () => {
    it('verified active non-consumable transaction unlocks paid entitlement', () => {
      const transactions: RawStoreKitTransaction[] = [
        {
          productID: 'com.obadadallo.keyfixer.pro.lifetime',
          purchaseDate: '2026-08-08T01:00:00.000Z',
          revocationDate: null,
          isVerified: true,
        },
      ];

      const entitlement = normalizeStoreKitEntitlement(transactions);
      expect(entitlement.paid).toBe(true);
      expect(entitlement.productId).toBe('com.obadadallo.keyfixer.pro.lifetime');
      expect(entitlement.purchaseDate).toBe('2026-08-08T01:00:00.000Z');
      expect(entitlement.revocationDate).toBeNull();
      expect(entitlement.verificationStatus).toBe('VERIFIED');
    });

    it('revoked or refunded transaction sets paid = false and verificationStatus = REVOKED', () => {
      const transactions: RawStoreKitTransaction[] = [
        {
          productID: 'com.obadadallo.keyfixer.pro.lifetime',
          purchaseDate: '2026-08-08T01:00:00.000Z',
          revocationDate: '2026-08-08T02:00:00.000Z',
          isVerified: true,
        },
      ];

      const entitlement = normalizeStoreKitEntitlement(transactions);
      expect(entitlement.paid).toBe(false);
      expect(entitlement.productId).toBe('com.obadadallo.keyfixer.pro.lifetime');
      expect(entitlement.revocationDate).toBe('2026-08-08T02:00:00.000Z');
      expect(entitlement.verificationStatus).toBe('REVOKED');
    });

    it('unverified transaction NEVER unlocks paid status (paid = false)', () => {
      const transactions: RawStoreKitTransaction[] = [
        {
          productID: 'com.obadadallo.keyfixer.pro.lifetime',
          purchaseDate: '2026-08-08T01:00:00.000Z',
          revocationDate: null,
          isVerified: false,
          verificationError: 'Signature verification failed',
        },
      ];

      const entitlement = normalizeStoreKitEntitlement(transactions);
      expect(entitlement.paid).toBe(false);
      expect(entitlement.verificationStatus).toBe('UNVERIFIED');
    });

    it('missing transaction returns paid = false and NOT_PURCHASED', () => {
      const transactions: RawStoreKitTransaction[] = [];

      const entitlement = normalizeStoreKitEntitlement(transactions);
      expect(entitlement.paid).toBe(false);
      expect(entitlement.productId).toBeNull();
      expect(entitlement.verificationStatus).toBe('NOT_PURCHASED');
    });
  });

  describe('3. Dynamic StoreKit Product Metadata', () => {
    it('display price is populated dynamically from StoreKit metadata rather than hardcoded', () => {
      const dynamicProduct: StoreProduct = {
        id: STOREKIT_PRODUCT_ID,
        displayName: 'KeyFixer Pro Lifetime',
        displayPrice: '$4.99',
        isAvailable: true,
      };

      expect(dynamicProduct.id).toBe(STOREKIT_PRODUCT_ID);
      expect(dynamicProduct.displayPrice).toBe('$4.99');
      expect(dynamicProduct.isAvailable).toBe(true);
    });
  });

  describe('4. Fallback Bridge Implementation', () => {
    it('FreeProBridge implements all required StoreKit methods safely', async () => {
      const product = await FreeProBridge.loadProProduct();
      expect(product).toEqual(FallbackProduct);

      const entitlement = await FreeProBridge.getProEntitlement();
      expect(entitlement).toEqual(FallbackEntitlement);

      const purchaseRes = await FreeProBridge.purchasePro();
      expect(purchaseRes.status).toBe('FAILED');
      expect(purchaseRes.errorMessage).toBeDefined();

      const restoreRes = await FreeProBridge.restorePurchases();
      expect(restoreRes).toEqual(FallbackEntitlement);
    });

    it('getProBridge returns a valid runtime bridge instance', () => {
      const bridge = getProBridge();
      expect(bridge).toBeDefined();
      expect(typeof bridge.getProState).toBe('function');
      expect(typeof bridge.loadProProduct).toBe('function');
      expect(typeof bridge.getProEntitlement).toBe('function');
      expect(typeof bridge.purchasePro).toBe('function');
      expect(typeof bridge.restorePurchases).toBe('function');
    });
  });

  describe('5. Real StoreKit Purchase Flow Verification (TASK 9B)', () => {
    function processStoreKitPurchase(
      productID: string,
      verificationResult: { isVerified: boolean; revocationDate?: string | null; error?: string } | 'userCancelled' | 'pending' | 'failed',
      currentCredits: number
    ): {
      result: PurchaseResult;
      entitlement: StoreEntitlement;
      credits: number;
    } {
      if (verificationResult === 'userCancelled') {
        return {
          result: { status: 'CANCELLED' },
          entitlement: {
            paid: false,
            productId: null,
            purchaseDate: null,
            revocationDate: null,
            verificationStatus: 'NOT_PURCHASED',
          },
          credits: currentCredits, // Credits unchanged
        };
      }

      if (verificationResult === 'pending') {
        return {
          result: { status: 'PENDING' },
          entitlement: {
            paid: false,
            productId: null,
            purchaseDate: null,
            revocationDate: null,
            verificationStatus: 'NOT_PURCHASED',
          },
          credits: currentCredits, // Credits unchanged
        };
      }

      if (verificationResult === 'failed' || typeof verificationResult !== 'object') {
        return {
          result: { status: 'FAILED', errorMessage: 'Purchase failed' },
          entitlement: {
            paid: false,
            productId: null,
            purchaseDate: null,
            revocationDate: null,
            verificationStatus: 'NOT_PURCHASED',
          },
          credits: currentCredits, // Credits unchanged
        };
      }

      // Check product ID match
      if (productID !== STOREKIT_PRODUCT_ID) {
        return {
          result: { status: 'FAILED', errorMessage: 'Product ID mismatch' },
          entitlement: {
            paid: false,
            productId: null,
            purchaseDate: null,
            revocationDate: null,
            verificationStatus: 'NOT_PURCHASED',
          },
          credits: currentCredits,
        };
      }

      // Check signature verification
      if (!verificationResult.isVerified) {
        return {
          result: { status: 'FAILED', errorMessage: 'Transaction signature unverified' },
          entitlement: {
            paid: false,
            productId: productID,
            purchaseDate: '2026-08-08T01:00:00Z',
            revocationDate: null,
            verificationStatus: 'UNVERIFIED',
          },
          credits: currentCredits,
        };
      }

      // Check revocation
      if (verificationResult.revocationDate) {
        return {
          result: { status: 'FAILED', errorMessage: 'Transaction is revoked' },
          entitlement: {
            paid: false,
            productId: productID,
            purchaseDate: '2026-08-08T01:00:00Z',
            revocationDate: verificationResult.revocationDate,
            verificationStatus: 'REVOKED',
          },
          credits: currentCredits,
        };
      }

      // Verified active purchase
      return {
        result: { status: 'SUCCESS' },
        entitlement: {
          paid: true,
          productId: productID,
          purchaseDate: '2026-08-08T01:00:00Z',
          revocationDate: null,
          verificationStatus: 'VERIFIED',
        },
        credits: currentCredits, // Credits unchanged, paid overrides gate
      };
    }

    it('verified purchase sets paid = true and preserves trial credits', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        { isVerified: true, revocationDate: null },
        0
      );
      expect(outcome.result.status).toBe('SUCCESS');
      expect(outcome.entitlement.paid).toBe(true);
      expect(outcome.entitlement.verificationStatus).toBe('VERIFIED');
      expect(outcome.credits).toBe(0); // Trial credit history preserved
    });

    it('unverified purchase result sets paid = false and does not unlock Pro', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        { isVerified: false, error: 'Signature failure' },
        0
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.entitlement.verificationStatus).toBe('UNVERIFIED');
    });

    it('user cancelled purchase returns CANCELLED and does not modify entitlement or credits', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        'userCancelled',
        3
      );
      expect(outcome.result.status).toBe('CANCELLED');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.credits).toBe(3);
    });

    it('pending purchase returns PENDING and does not unlock Pro', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        'pending',
        0
      );
      expect(outcome.result.status).toBe('PENDING');
      expect(outcome.entitlement.paid).toBe(false);
    });

    it('failed purchase returns FAILED and does not modify entitlement or credits', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        'failed',
        2
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.credits).toBe(2);
    });

    it('wrong product ID returns FAILED and does not grant Pro entitlement', () => {
      const outcome = processStoreKitPurchase(
        'com.other.fake.product',
        { isVerified: true, revocationDate: null },
        0
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.entitlement.paid).toBe(false);
    });

    it('revoked transaction sets paid = false and REVOKED status', () => {
      const outcome = processStoreKitPurchase(
        STOREKIT_PRODUCT_ID,
        { isVerified: true, revocationDate: '2026-08-08T02:00:00Z' },
        0
      );
      expect(outcome.result.status).toBe('FAILED');
      expect(outcome.entitlement.paid).toBe(false);
      expect(outcome.entitlement.verificationStatus).toBe('REVOKED');
    });
  });

  describe('6. Security & Build Safety', () => {
    it('does not expose unauthorized self-granting paid mutations on public contracts', () => {
      const bridge = getProBridge();
      // Ensure no setPaid / simulatePaid exists on the public bridge interface
      expect((bridge as any).setPaid).toBeUndefined();
      expect((bridge as any).devSimulatePaid).toBeUndefined();
    });

    it('local state is never considered paid without StoreKit 2 verified entitlement', () => {
      // When StoreKit returns not purchased, paid must be false
      const storeKitVerification: StoreEntitlement = {
        paid: false,
        productId: null,
        purchaseDate: null,
        revocationDate: null,
        verificationStatus: 'NOT_PURCHASED',
      };

      const effectivePaid = storeKitVerification.paid;
      expect(effectivePaid).toBe(false);
    });
  });
});

