// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('@tauri-apps/api/event', () => ({
  __esModule: true,
  listen: vi.fn().mockResolvedValue(() => {}),
  emit: vi.fn().mockResolvedValue(undefined),
}));

import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ProRuntimeBridge, ProStateDto } from '../src/pro/contracts';
import { getProPanel } from '../src/pro/bridge';

const ProPanel = getProPanel();

describe('ProPanel Lifecycle & Legal Integration Tests (TASK 8C)', () => {
  if (!ProPanel) {
    it('returns null when absent', () => {
      expect(getProPanel()).toBeNull();
    });
    return;
  }

  let mockBridge: ProRuntimeBridge;
  let currentState: ProStateDto;

  beforeEach(() => {
    cleanup();
    vi.useFakeTimers();

    currentState = {
      mode: 'free',
      uiState: 'FREE',
      trialCreditsRemaining: 0,
      trialStarted: false,
      inlineFixEnabled: false,
    };

    mockBridge = {
      getProState: vi.fn().mockImplementation(async () => currentState),
      activateTrial: vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'trial',
          uiState: 'TRIAL_ACTIVE',
          trialCreditsRemaining: 5,
          trialStarted: true,
          inlineFixEnabled: true,
        };
        return true;
      }),
      setInlineFixPreference: vi.fn().mockImplementation(async (enabled: boolean) => {
        currentState.inlineFixEnabled = enabled;
      }),
      checkAccessibility: vi.fn().mockResolvedValue(true),
      openAccessibilitySettings: vi.fn().mockResolvedValue(undefined),
      submitConversionResponse: vi.fn().mockResolvedValue(undefined),
      loadProProduct: vi.fn().mockResolvedValue(null),
      getProEntitlement: vi.fn().mockResolvedValue({ paid: false, verificationStatus: 'NOT_PURCHASED' }),
      purchasePro: vi.fn().mockResolvedValue({ status: 'FAILED' }),
      restorePurchases: vi.fn().mockResolvedValue({ status: 'NOT_FOUND' }),
    };
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders Free tier button in initial state', async () => {
    render(<ProPanel bridge={mockBridge} isRTL={false} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByText('Try Pro Free')).toBeInTheDocument();
  });

  it('clicking Try Pro Free opens trial modal with feature list', async () => {
    render(<ProPanel bridge={mockBridge} isRTL={false} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    fireEvent.click(screen.getByText('Try Pro Free'));
    expect(screen.getByText('Try KeyFixer Pro')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial (5 Fixes)')).toBeInTheDocument();
  });

  it('activating trial transitions to 5 credits and starts trial', async () => {
    const onStatusChange = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={false} onStatusChange={onStatusChange} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    fireEvent.click(screen.getByText('Try Pro Free'));
    await act(async () => {
      fireEvent.click(screen.getByText('Start Free Trial (5 Fixes)'));
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(mockBridge.activateTrial).toHaveBeenCalled();
  });

  it('renders Paywall modal with secondary legal links (Terms, Privacy, Purchase & Refund)', async () => {
    currentState = {
      mode: 'trial',
      uiState: 'TRIAL_EXHAUSTED',
      trialCreditsRemaining: 0,
      trialStarted: true,
      inlineFixEnabled: true,
    };

    const handleOpenLegal = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={false} onOpenLegal={handleOpenLegal} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // Click Unlock Pro
    fireEvent.click(screen.getByText('Unlock Pro'));
    expect(screen.getByText('Trial Ended')).toBeInTheDocument();

    // Verify secondary legal links exist
    const termsLink = screen.getByText('Terms');
    const privacyLink = screen.getByText('Privacy');
    const refundLink = screen.getByText('Purchase & Refund');

    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(refundLink).toBeInTheDocument();

    // Clicking terms link invokes onOpenLegal with 'terms'
    fireEvent.click(termsLink);
    expect(handleOpenLegal).toHaveBeenCalledWith('terms');
  });

  it('renders Arabic Paywall modal with Arabic legal links', async () => {
    currentState = {
      mode: 'trial',
      uiState: 'TRIAL_EXHAUSTED',
      trialCreditsRemaining: 0,
      trialStarted: true,
      inlineFixEnabled: true,
    };

    const handleOpenLegal = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={true} onOpenLegal={handleOpenLegal} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // Click Unlock Pro in Arabic
    fireEvent.click(screen.getByText('تفعيل نسخة Pro'));
    expect(screen.getByText('انتهت المحاولات التجريبية')).toBeInTheDocument();

    // Verify Arabic legal links
    const termsLink = screen.getByText('الشروط');
    const privacyLink = screen.getByText('الخصوصية');
    const refundLink = screen.getByText('الشراء والاسترجاع');

    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(refundLink).toBeInTheDocument();

    fireEvent.click(privacyLink);
    expect(handleOpenLegal).toHaveBeenCalledWith('privacy');
  });

  // ── TASK 9B Real Purchase Flow Tests ──────────────────────────────────────────

  describe('Real Purchase Flow (TASK 9B)', () => {
    beforeEach(() => {
      currentState = {
        mode: 'trial',
        uiState: 'TRIAL_EXHAUSTED',
        trialCreditsRemaining: 0,
        trialStarted: true,
        inlineFixEnabled: false, // User had turned inline fix off
      };

      mockBridge.loadProProduct = vi.fn().mockResolvedValue({
        id: 'com.obadadallo.keyfixer.pro.lifetime',
        displayName: 'KeyFixer Pro Lifetime',
        displayPrice: '$4.99',
        isAvailable: true,
      });

      mockBridge.getProEntitlement = vi.fn().mockResolvedValue({
        paid: false,
        productId: null,
        purchaseDate: null,
        revocationDate: null,
        verificationStatus: 'NOT_PURCHASED',
      });

      mockBridge.purchasePro = vi.fn().mockResolvedValue({
        status: 'SUCCESS',
      });
    });

    it('renders dynamic display price from StoreKit on purchase button', async () => {
      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      expect(buyBtn).toHaveTextContent('Get KeyFixer Pro • $4.99');
    });

    it('handles verified successful purchase: unlocks Pro, preserves user inline preference, shows success toast', async () => {
      const onStatusChange = vi.fn();
      mockBridge.purchasePro = vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'paid',
          uiState: 'PAID',
          trialCreditsRemaining: 0,
          trialStarted: true,
          inlineFixEnabled: false, // User preference preserved
        };
        return { status: 'SUCCESS' };
      });
      mockBridge.getProEntitlement = vi.fn().mockResolvedValue({
        paid: true,
        productId: 'com.obadadallo.keyfixer.pro.lifetime',
        purchaseDate: '2026-08-08T01:00:00Z',
        revocationDate: null,
        verificationStatus: 'VERIFIED',
      });
      mockBridge.getProState = vi.fn().mockImplementation(async () => currentState);

      render(<ProPanel bridge={mockBridge} isRTL={false} onStatusChange={onStatusChange} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      await act(async () => {
        fireEvent.click(buyBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockBridge.purchasePro).toHaveBeenCalledTimes(1);
      expect(mockBridge.getProEntitlement).toHaveBeenCalled();
      expect(onStatusChange).toHaveBeenCalledWith('pro');
      expect(screen.getByTestId('purchase-success-toast')).toHaveTextContent('KeyFixer Pro unlocked');
    });

    it('handles user cancellation without error banner or trial credit mutation', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({ status: 'CANCELLED' });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      await act(async () => {
        fireEvent.click(buyBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.queryByTestId('purchase-error-banner')).toBeNull();
      expect(buyBtn).not.toBeDisabled();
      expect(screen.getByText('Trial Ended')).toBeInTheDocument();
    });

    it('handles pending purchase with localized approval banner', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({ status: 'PENDING' });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      await act(async () => {
        fireEvent.click(buyBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.getByTestId('purchase-pending-banner')).toHaveTextContent('Purchase pending approval');
    });

    it('handles genuine purchase failure with concise localized error message', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({
        status: 'FAILED',
        errorMessage: 'Payment card declined',
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      await act(async () => {
        fireEvent.click(buyBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      const errorBanner = screen.getByTestId('purchase-error-banner');
      expect(errorBanner).toHaveTextContent("Purchase couldn't be completed. Please try again.");
      expect(errorBanner).not.toHaveTextContent('Payment card declined'); // No internal error text leaked
    });

    it('prevents double-click / concurrent purchase invocations', async () => {
      let resolvePurchase: (val: any) => void;
      mockBridge.purchasePro = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolvePurchase = resolve; })
      );

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      fireEvent.click(buyBtn);
      fireEvent.click(buyBtn); // Repeated click while active

      expect(mockBridge.purchasePro).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolvePurchase({ status: 'CANCELLED' });
        await vi.advanceTimersByTimeAsync(50);
      });
    });

    it('renders StoreKit unavailable message and disables CTA when product is unavailable', async () => {
      mockBridge.loadProProduct = vi.fn().mockResolvedValue({
        id: 'com.obadadallo.keyfixer.pro.lifetime',
        displayName: 'KeyFixer Pro Lifetime',
        displayPrice: '',
        isAvailable: false,
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByText('Unlock Pro'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.getByTestId('purchase-unavailable-banner')).toHaveTextContent('Purchase temporarily unavailable');
      const buyBtn = screen.getByTestId('purchase-pro-button');
      expect(buyBtn).toBeDisabled();
    });
  });

  // ── TASK 9C / 9C.1 Restore Purchases & Revocation Tests ─────────────────────

  describe('Restore Purchases & Revocation Handling (TASK 9C / 9C.1)', () => {
    beforeEach(() => {
      currentState = {
        mode: 'trial',
        uiState: 'TRIAL_EXHAUSTED',
        trialCreditsRemaining: 0,
        trialStarted: true,
        inlineFixEnabled: true,
      };
    });

    it('handles RESTORED: unlocks Pro, updates status, displays success toast, preserves user preference', async () => {
      const onStatusChange = vi.fn();
      mockBridge.restorePurchases = vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'paid',
          uiState: 'PAID',
          trialCreditsRemaining: 0,
          trialStarted: true,
          inlineFixEnabled: true,
        };
        return {
          status: 'RESTORED',
          entitlement: {
            paid: true,
            productId: 'com.obadadallo.keyfixer.pro.lifetime',
            purchaseDate: '2026-08-08T01:00:00Z',
            revocationDate: null,
            verificationStatus: 'VERIFIED',
          },
        };
      });
      mockBridge.getProState = vi.fn().mockImplementation(async () => currentState);

      render(<ProPanel bridge={mockBridge} isRTL={false} onStatusChange={onStatusChange} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-exhausted');
      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockBridge.restorePurchases).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('pro');
      expect(screen.getByTestId('restore-success-toast')).toHaveTextContent('KeyFixer Pro restored');
    });

    it('handles NOT_FOUND: shows info message, remains unpaid, preserves trial credits', async () => {
      mockBridge.restorePurchases = vi.fn().mockResolvedValue({
        status: 'NOT_FOUND',
        entitlement: {
          paid: false,
          productId: null,
          purchaseDate: null,
          revocationDate: null,
          verificationStatus: 'NOT_PURCHASED',
        },
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-exhausted');
      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.getByTestId('restore-info-banner')).toHaveTextContent('No KeyFixer Pro purchase was found for this Apple Account.');
      expect(screen.queryByTestId('restore-success-toast')).toBeNull();
    });

    it('handles FAILED: shows localized error message without raw error, does not modify trial credits', async () => {
      mockBridge.restorePurchases = vi.fn().mockResolvedValue({
        status: 'FAILED',
        entitlement: {
          paid: false,
          productId: null,
          purchaseDate: null,
          revocationDate: null,
          verificationStatus: 'NOT_PURCHASED',
        },
        errorMessage: 'AppStore.sync network failure',
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-exhausted');
      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      const errBanner = screen.getByTestId('restore-error-banner');
      expect(errBanner).toHaveTextContent("Couldn't restore purchases. Please try again.");
      expect(errBanner).not.toHaveTextContent('network failure'); // No raw error leaked
    });

    it('sync throwing while already paid does NOT falsely downgrade paid entitlement', async () => {
      currentState = {
        mode: 'paid',
        uiState: 'PAID',
        trialCreditsRemaining: 0,
        trialStarted: true,
        inlineFixEnabled: true,
      };

      // AppStore.sync failed due to network error, but existing verified entitlement is intact
      mockBridge.restorePurchases = vi.fn().mockResolvedValue({
        status: 'FAILED',
        entitlement: {
          paid: true,
          productId: 'com.obadadallo.keyfixer.pro.lifetime',
          purchaseDate: '2026-08-08T01:00:00Z',
          revocationDate: null,
          verificationStatus: 'VERIFIED',
        },
        errorMessage: 'AppStore.sync network timeout',
      });

      mockBridge.getProState = vi.fn().mockResolvedValue(currentState);

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      // App stays in PAID state
      expect(screen.getByText('Inline Fix')).toBeInTheDocument();

      const res = await mockBridge.restorePurchases();
      expect(res.status).toBe('FAILED');
      expect(res.entitlement.paid).toBe(true); // Retains verified entitlement
    });

    it('handles Arabic Restore Purchases UI and localized Arabic messages', async () => {
      mockBridge.restorePurchases = vi.fn().mockResolvedValue({
        status: 'NOT_FOUND',
        entitlement: {
          paid: false,
          productId: null,
          purchaseDate: null,
          revocationDate: null,
          verificationStatus: 'NOT_PURCHASED',
        },
      });

      render(<ProPanel bridge={mockBridge} isRTL={true} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-exhausted');
      expect(restoreBtn).toHaveTextContent('استعادة المشتريات');

      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.getByTestId('restore-info-banner')).toHaveTextContent('لم يتم العثور على شراء KeyFixer Pro مرتبط بحساب Apple هذا.');
    });

    it('prevents duplicate concurrent restore calls', async () => {
      let resolveRestore: (val: any) => void;
      mockBridge.restorePurchases = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolveRestore = resolve; })
      );

      render(<ProPanel bridge={mockBridge} isRTL={false} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-exhausted');
      fireEvent.click(restoreBtn);
      fireEvent.click(restoreBtn); // Double click

      expect(mockBridge.restorePurchases).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveRestore({ status: 'NOT_FOUND', entitlement: { paid: false, verificationStatus: 'NOT_PURCHASED' } });
        await vi.advanceTimersByTimeAsync(50);
      });
    });

    it('handles paid -> refunded/revoked transition: locks Pro cleanly, preserves unused trial credits', async () => {
      // User originally paid with 2 trial credits unused
      currentState = {
        mode: 'paid',
        uiState: 'PAID',
        trialCreditsRemaining: 2,
        trialStarted: true,
        inlineFixEnabled: true,
      };

      // StoreKit detects refund/revocation
      mockBridge.getProEntitlement = vi.fn().mockResolvedValue({
        paid: false,
        productId: 'com.obadadallo.keyfixer.pro.lifetime',
        purchaseDate: '2026-08-08T01:00:00Z',
        revocationDate: '2026-08-08T02:00:00Z',
        verificationStatus: 'REVOKED',
      });

      // Updated state returned from Rust after StoreKit reconciliation
      const revokedState: ProStateDto = {
        mode: 'trial',
        uiState: 'TRIAL_ACTIVE',
        trialCreditsRemaining: 2, // Trial history preserved!
        trialStarted: true,
        inlineFixEnabled: true,
      };

      mockBridge.getProState = vi.fn().mockResolvedValue(revokedState);

      const onStatusChange = vi.fn();
      render(<ProPanel bridge={mockBridge} isRTL={false} onStatusChange={onStatusChange} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      // App transitions from PAID to TRIAL_ACTIVE cleanly without crash or credit loss
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 credits preserved
    });
  });
});

