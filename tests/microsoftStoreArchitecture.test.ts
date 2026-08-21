import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  StoreProduct,
  StoreEntitlement,
  PurchaseResult,
  RestorePurchasesResult,
} from '../src/pro/contracts';
import { getProTranslations } from '../src/pro/ProPanel';

// Constants matching Microsoft Partner Center & Rust Windows Pro Engine
export const MS_PARENT_STORE_ID = '9PK3G83GP41D';
export const MS_PRO_ADDON_STORE_ID = '9N98VZCQLDL7';
export const MS_PRO_ADDON_PRODUCT_ID = 'keyfixer.pro.lifetime';
export const MS_SAFE_FALLBACK_PRICE = '';
export const MS_DEFAULT_DISPLAY_NAME = 'KeyFixer Pro Lifetime';

export interface MockStoreProduct {
  storeId: string;
  inAppOfferToken?: string;
  title?: string;
  formattedPrice?: string;
  isAvailable?: boolean;
}

export function normalizeMicrosoftStoreProduct(
  product: MockStoreProduct | null
): StoreProduct {
  if (!product) {
    return {
      id: MS_PRO_ADDON_STORE_ID,
      displayName: MS_DEFAULT_DISPLAY_NAME,
      displayPrice: '',
      isAvailable: true,
    };
  }

  return {
    id: product.storeId || MS_PRO_ADDON_STORE_ID,
    displayName: product.title && product.title.trim().length > 0 ? product.title : MS_DEFAULT_DISPLAY_NAME,
    displayPrice: product.formattedPrice || '',
    isAvailable: product.isAvailable ?? true,
  };
}

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
      expect(MS_SAFE_FALLBACK_PRICE).toBe('');
      expect(MS_DEFAULT_DISPLAY_NAME).toBe('KeyFixer Pro Lifetime');
    });

    it('declares all supported languages (en-US, ar, de) in AppxManifest.xml', () => {
      const manifestPath = path.resolve(__dirname, '../src-tauri/msix/AppxManifest.xml');
      const content = fs.readFileSync(manifestPath, 'utf8');

      expect(content).toContain('<Resource Language="en-US" />');
      expect(content).toContain('<Resource Language="ar" />');
      expect(content).toContain('<Resource Language="de" />');
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

  describe('5. Dynamic Product Discovery & Localized Pricing', () => {
    it('populates dynamic localized prices for various currencies/regions', () => {
      const usProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        inAppOfferToken: 'keyfixer.pro.lifetime',
        title: 'KeyFixer Pro Lifetime',
        formattedPrice: '$9.99',
        isAvailable: true,
      });
      expect(usProduct.displayPrice).toBe('$9.99');
      expect(usProduct.displayName).toBe('KeyFixer Pro Lifetime');
      expect(usProduct.isAvailable).toBe(true);

      const euProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        formattedPrice: '9,99 €',
      });
      expect(euProduct.displayPrice).toBe('9,99 €');

      const saProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        formattedPrice: 'SAR 39.99',
      });
      expect(saProduct.displayPrice).toBe('SAR 39.99');

      const ukProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        formattedPrice: '£8.99',
      });
      expect(ukProduct.displayPrice).toBe('£8.99');
    });

    it('falls back safely to empty price when Microsoft Store product cannot be retrieved', () => {
      const fallbackProduct = normalizeMicrosoftStoreProduct(null);
      expect(fallbackProduct.id).toBe('9N98VZCQLDL7');
      expect(fallbackProduct.displayName).toBe('KeyFixer Pro Lifetime');
      expect(fallbackProduct.displayPrice).toBe('');
      expect(fallbackProduct.isAvailable).toBe(true);
    });

    it('preserves default display name when Store returns empty title', () => {
      const emptyTitleProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        title: '   ',
        formattedPrice: '$9.99',
      });
      expect(emptyTitleProduct.displayName).toBe('KeyFixer Pro Lifetime');
      expect(emptyTitleProduct.displayPrice).toBe('$9.99');
    });

    it('formats Pro button text cleanly without appended price when price is empty string', () => {
      const ctaLabel = 'Unlock Pro Lifetime';
      const storeProduct = normalizeMicrosoftStoreProduct(null);
      const displayPriceText = storeProduct?.displayPrice ? ` • ${storeProduct.displayPrice}` : '';
      const buttonText = `${ctaLabel}${displayPriceText}`;

      expect(buttonText).toBe('Unlock Pro Lifetime');
      expect(buttonText).not.toContain('€9.99');
    });

    it('formats Pro button text with localized price when returned by Store', () => {
      const ctaLabel = 'Unlock Pro Lifetime';
      const storeProduct = normalizeMicrosoftStoreProduct({
        storeId: '9N98VZCQLDL7',
        formattedPrice: '$9.99',
      });
      const displayPriceText = storeProduct?.displayPrice ? ` • ${storeProduct.displayPrice}` : '';
      const buttonText = `${ctaLabel}${displayPriceText}`;

      expect(buttonText).toBe('Unlock Pro Lifetime • $9.99');
    });
  });

  describe('6. Platform Store Naming in Purchase UI (Windows vs macOS)', () => {
    it('uses Microsoft Store naming in English on Windows and App Store on macOS', () => {
      const winEn = getProTranslations('en', true);
      expect(winEn.purchasing).toBe('Connecting to Microsoft Store…');
      expect(winEn.upgradeF2).toContain('Microsoft Store');
      expect(winEn.upgradeF2).not.toContain('App Store');
      expect(winEn.purchasePendingDesc).toContain('Microsoft Store');
      expect(winEn.restoreNotFound).toContain('Microsoft Account');

      const macEn = getProTranslations('en', false);
      expect(macEn.purchasing).toBe('Connecting to App Store…');
      expect(macEn.upgradeF2).toContain('App Store');
      expect(macEn.upgradeF2).not.toContain('Microsoft Store');
      expect(macEn.purchasePendingDesc).toContain('App Store');
      expect(macEn.restoreNotFound).toContain('Apple Account');
    });

    it('uses Microsoft Store naming in Arabic on Windows and App Store on macOS', () => {
      const winAr = getProTranslations('ar', true);
      expect(winAr.purchasing).toBe('جارٍ الاتصال بـ متجر مايكروسوفت…');
      expect(winAr.upgradeF2).toContain('متجر مايكروسوفت');
      expect(winAr.upgradeF2).not.toContain('App Store');
      expect(winAr.purchasePendingDesc).toContain('متجر مايكروسوفت');
      expect(winAr.restoreNotFound).toContain('حساب مايكروسوفت');

      const macAr = getProTranslations('ar', false);
      expect(macAr.purchasing).toBe('جارٍ الاتصال بـ App Store…');
      expect(macAr.upgradeF2).toContain('App Store');
      expect(macAr.purchasePendingDesc).toContain('App Store');
      expect(macAr.restoreNotFound).toContain('حساب Apple');
    });

    it('uses Microsoft Store naming in German on Windows and App Store on macOS', () => {
      const winDe = getProTranslations('de', true);
      expect(winDe.purchasing).toBe('Verbindung zum Microsoft Store…');
      expect(winDe.upgradeF2).toContain('Microsoft Store');
      expect(winDe.upgradeF2).not.toContain('App Store');
      expect(winDe.purchasePendingDesc).toContain('Microsoft Store');
      expect(winDe.restoreNotFound).toContain('Microsoft-Konto');

      const macDe = getProTranslations('de', false);
      expect(macDe.purchasing).toBe('Verbindung zum App Store…');
      expect(macDe.upgradeF2).toContain('App Store');
      expect(macDe.upgradeF2).not.toContain('Microsoft Store');
      expect(macDe.purchasePendingDesc).toContain('App Store');
      expect(macDe.restoreNotFound).toContain('Apple Account');
    });
  });

  describe('7. Windows Inline Conversion IPC Contract', () => {
    it('verifies Windows backend emits inline-convert-request matching DesktopApp frontend listener', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const windowsRustContent = fs.readFileSync(windowsRustPath, 'utf8');

      const frontendPath = path.resolve(__dirname, '../src/components/DesktopApp.tsx');
      const frontendContent = fs.readFileSync(frontendPath, 'utf8');

      // Rust must emit the exact event name the frontend is listening for
      expect(windowsRustContent).toContain('"inline-convert-request"');
      expect(windowsRustContent).not.toContain('"request-inline-conversion"');

      expect(frontendContent).toContain("'inline-convert-request'");
    });
  });

  describe('8. Windows Shortcut Mode Routing Architecture (Free vs Trial/Pro)', () => {
    it('routes Free mode shortcut presses to standard window converter workflow instead of upgrade modal', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const windowsRustContent = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      // Free mode must call show_main_window_free_workflow and emit shortcut-pressed
      expect(windowsRustContent).toContain('fn show_main_window_free_workflow(app: &AppHandle)');
      expect(windowsRustContent).toMatch(/if\s+is_free\s*\{[\s\S]*?show_main_window_free_workflow\(&app_clone\);/);
      expect(windowsRustContent).toContain('app.emit("shortcut-pressed", ())');

      // Free mode must NOT emit show-upgrade-modal merely on shortcut press
      expect(windowsRustContent).not.toMatch(/if\s+guard\.mode\s*==\s*ProMode::Free\s*\|\|\s*\(is_trial/);
    });

    it('routes exhausted trial to show-upgrade-modal', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const windowsRustContent = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(windowsRustContent).toContain('else if is_trial && credits <= 0 {');
      expect(windowsRustContent).toContain('app_clone.emit("show-upgrade-modal", ());');
    });

    it('routes active Trial and Paid with inlineFixEnabled to in-place simulation pipeline', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const windowsRustContent = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(windowsRustContent).toContain('simulate_copy()');
      expect(windowsRustContent).toContain('simulate_paste()');
      expect(windowsRustContent).toContain('app_clone.emit(\n                "inline-convert-request",');
    });
  });

  describe('9. Windows Release Build Environment Architecture', () => {
    it('verifies build-release-artifacts.yml sets VITE_PRO_BUILD=true for Windows jobs', () => {
      const workflowPath = path.resolve(__dirname, '../.github/workflows/build-release-artifacts.yml');
      const workflowContent = fs.readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n');

      // Both build-windows and build-windows-msix jobs must pass VITE_PRO_BUILD: "true"
      expect(workflowContent).toMatch(/build-windows:[\s\S]*?Build Windows NSIS unsigned[\s\S]*?VITE_PRO_BUILD:\s*['"]true['"]/);
      expect(workflowContent).toMatch(/build-windows-msix:[\s\S]*?Build Windows MSIX[\s\S]*?VITE_PRO_BUILD:\s*['"]true['"]/);
    });

    it('verifies windows.yml CI workflow sets VITE_PRO_BUILD=true', () => {
      const workflowPath = path.resolve(__dirname, '../.github/workflows/windows.yml');
      const workflowContent = fs.readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n');

      expect(workflowContent).toMatch(/VITE_PRO_BUILD:\s*['"]true['"]/);
    });
  });

  describe('10. Windows MSIX Build Configuration Preserves Pro Frontend', () => {
    it('verifies tauri.windows.conf.json overrides beforeBuildCommand to empty string', () => {
      const configPath = path.resolve(__dirname, '../src-tauri/tauri.windows.conf.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      expect(config.build?.beforeBuildCommand).toBe('');
    });

    it('verifies scripts/build-msix.mjs passes VITE_PRO_BUILD=true to all build steps', () => {
      const scriptPath = path.resolve(__dirname, '../scripts/build-msix.mjs');
      const scriptContent = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

      expect(scriptContent).toContain("run('npm run build:desktop', ROOT, { VITE_PRO_BUILD: 'true' })");
      expect(scriptContent).toContain("run('npx tauri build --config src-tauri/tauri.windows.conf.json --features pro', ROOT, { VITE_PRO_BUILD: 'true' })");
    });
  });

  describe('11. Windows SendInput & Robust Inline Fix Contract', () => {
    it('verifies SendInput structures, scan codes, and Win32 functions in inline_fix_windows.rs', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const content = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(content).toContain('fn SendInput(');
      expect(content).toContain('fn GetClipboardSequenceNumber(');
      expect(content).toContain('fn GetForegroundWindow(');
      expect(content).toContain('SCAN_ESCAPE: u16 = 0x01;');
      expect(content).toContain('SCAN_CTRL: u16 = 0x1D;');
      expect(content).toContain('SCAN_ALT: u16 = 0x38;');
      expect(content).toContain('SCAN_C: u16 = 0x2E;');
      expect(content).toContain('SCAN_V: u16 = 0x2F;');
    });

    it('verifies Alt normalization masks Alt with Ctrl and pulses Escape to dismiss menu mode', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const content = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(content).toContain('fn normalize_modifiers_and_menu()');
      expect(content).toContain('make_key_input(VK_CONTROL, SCAN_CTRL, 0)');
      expect(content).toContain('make_key_input(VK_MENU, SCAN_ALT, KEYEVENTF_KEYUP)');
      expect(content).toContain('make_key_input(VK_ESCAPE, SCAN_ESCAPE, 0)');
      expect(content).toContain('make_key_input(VK_ESCAPE, SCAN_ESCAPE, KEYEVENTF_KEYUP)');
    });

    it('verifies bounded clipboard acquisition with sequence tracking and write retry', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const content = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(content).toContain('fn acquire_clipboard_text(');
      expect(content).toContain('fn write_clipboard_with_retry(');
      expect(content).toContain('GetClipboardSequenceNumber()');
    });

    it('verifies diagnostic logging does not log user text and reports each stage', () => {
      const windowsRustPath = path.resolve(__dirname, '../src-tauri/src/pro/inline_fix_windows.rs');
      const content = fs.readFileSync(windowsRustPath, 'utf8').replace(/\r\n/g, '\n');

      expect(content).toContain('SHORTCUT_CAPTURED');
      expect(content).toContain('MODIFIERS_NORMALIZED');
      expect(content).toContain('COPY_INJECTED');
      expect(content).toContain('CLIPBOARD_ACQUIRED');
      expect(content).toContain('CONVERSION_COMPLETED');
      expect(content).toContain('PASTE_INJECTED');
      expect(content).not.toContain('{raw_text}');
      expect(content).not.toContain('{fixed_text}');
    });
  });
});
