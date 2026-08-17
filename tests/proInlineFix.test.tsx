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

describe('ProPanel Instant Fix, Discoverability & Legal Integration Tests (Phase 3)', () => {
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
      isAppStore: true,
    };

    mockBridge = {
      getProState: vi.fn().mockImplementation(async () => currentState),
      activateTrial: vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'trial',
          uiState: 'TRIAL_ACTIVE',
          trialCreditsRemaining: 25,
          trialStarted: true,
          inlineFixEnabled: true,
          isAppStore: true,
        };
        return true;
      }),
      setInlineFixPreference: vi.fn().mockImplementation(async (enabled: boolean) => {
        currentState.inlineFixEnabled = enabled;
      }),
      checkPostEventPermission: vi.fn().mockResolvedValue(true),
      requestPostEventPermission: vi.fn().mockResolvedValue(true),
      openPostEventSettings: vi.fn().mockResolvedValue(undefined),
      submitConversionResponse: vi.fn().mockResolvedValue(undefined),
      loadProProduct: vi.fn().mockResolvedValue({
        id: 'com.obadadallo.keyfixer.pro.lifetime',
        displayName: 'KeyFixer Pro Lifetime',
        displayPrice: '$4.99',
        isAvailable: true,
      }),
      getProEntitlement: vi.fn().mockResolvedValue({ paid: false, verificationStatus: 'NOT_PURCHASED' }),
      purchasePro: vi.fn().mockResolvedValue({ status: 'FAILED' }),
      restorePurchases: vi.fn().mockResolvedValue({ status: 'NOT_FOUND' }),
      restartKeyFixer: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders FREE state with Try 25 Fixes Free, Unlock Pro Lifetime, and Restore Purchases simultaneously', async () => {
    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('start-trial-button')).toHaveTextContent('Try 25 Fixes Free');
    expect(screen.getByTestId('unlock-pro-button-free')).toHaveTextContent('Unlock Pro Lifetime • $4.99');
    expect(screen.getByTestId('restore-purchases-button-main')).toHaveTextContent('Restore Purchases');
  });

  it('clicking Try 25 Fixes Free opens trial modal with Instant Fix explanation and generic compatibility disclaimer', async () => {
    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    fireEvent.click(screen.getByTestId('start-trial-button'));
    expect(screen.getByText('Try KeyFixer Pro')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial (25 Fixes)')).toBeInTheDocument();
    expect(screen.getByText(/Instant Fix works in supported Mac apps and text fields/)).toBeInTheDocument();
    expect(screen.getByText(/If unavailable in an app, standard Copy → KeyFixer → Fix → Paste is always available/)).toBeInTheDocument();
  });

  it('activating trial transitions to TRIAL_ACTIVE and starts 25 credits trial', async () => {
    const onStatusChange = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" onStatusChange={onStatusChange} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    fireEvent.click(screen.getByTestId('start-trial-button'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-trial-button'));
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(mockBridge.activateTrial).toHaveBeenCalled();
  });

  it('TRIAL_ACTIVE state keeps Unlock Pro Lifetime and Restore Purchases visible alongside credit counter', async () => {
    currentState = {
      mode: 'trial',
      uiState: 'TRIAL_ACTIVE',
      trialCreditsRemaining: 18,
      trialStarted: true,
      inlineFixEnabled: true,
      isAppStore: true,
    };

    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('trial-credit-badge')).toHaveTextContent('18/25');
    expect(screen.getByTestId('unlock-pro-button-trial')).toHaveTextContent('Unlock Pro Lifetime • $4.99');
    expect(screen.getByTestId('restore-purchases-button-trial')).toHaveTextContent('Restore Purchases');
    expect(screen.getByText('Instant Fix')).toBeInTheDocument();
  });

  it('Accessibility UI is absent in App Store mode (isAppStore = true)', async () => {
    currentState = {
      mode: 'trial',
      uiState: 'TRIAL_ACTIVE',
      trialCreditsRemaining: 25,
      trialStarted: true,
      inlineFixEnabled: true,
      isAppStore: true,
    };
    mockBridge.checkPostEventPermission = vi.fn().mockResolvedValue(false);

    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // In App Store mode, no Accessibility shield button is rendered
    expect(screen.queryByTitle('Accessibility permission missing')).toBeNull();
    expect(screen.queryByTitle('Accessibility permission missing (click to grant)')).toBeNull();
    expect(mockBridge.openPostEventSettings).not.toHaveBeenCalled();
  });

  it('renders Paywall modal with secondary legal links (Terms, Privacy, Purchase & Refund)', async () => {
    currentState = {
      mode: 'trial',
      uiState: 'TRIAL_EXHAUSTED',
      trialCreditsRemaining: 0,
      trialStarted: true,
      inlineFixEnabled: true,
      isAppStore: true,
    };

    const handleOpenLegal = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" onOpenLegal={handleOpenLegal} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    fireEvent.click(screen.getByTestId('unlock-pro-button-exhausted'));
    expect(screen.getByText('KeyFixer Pro Lifetime')).toBeInTheDocument();

    const termsLink = screen.getByText('Terms');
    const privacyLink = screen.getByText('Privacy');
    const refundLink = screen.getByText('Purchase & Refund');

    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(refundLink).toBeInTheDocument();

    fireEvent.click(termsLink);
    expect(handleOpenLegal).toHaveBeenCalledWith('terms');
  });

  it('renders Arabic UI and Paywall modal with natural RTL copy and Arabic legal links', async () => {
    currentState = {
      mode: 'free',
      uiState: 'FREE',
      trialCreditsRemaining: 0,
      trialStarted: false,
      inlineFixEnabled: false,
      isAppStore: true,
    };

    const handleOpenLegal = vi.fn();
    render(<ProPanel bridge={mockBridge} isRTL={true} lang="ar" onOpenLegal={handleOpenLegal} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('start-trial-button')).toHaveTextContent('تجربة 25 تصحيحاً مجاناً');
    expect(screen.getByTestId('unlock-pro-button-free')).toHaveTextContent('الترقية إلى Pro مدى الحياة • $4.99');
    expect(screen.getByTestId('restore-purchases-button-main')).toHaveTextContent('استعادة المشتريات');

    fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
    expect(screen.getByText('KeyFixer Pro مدى الحياة')).toBeInTheDocument();

    const termsLink = screen.getByText('الشروط');
    const privacyLink = screen.getByText('الخصوصية');
    const refundLink = screen.getByText('الشراء والاسترجاع');

    expect(termsLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
    expect(refundLink).toBeInTheDocument();

    fireEvent.click(privacyLink);
    expect(handleOpenLegal).toHaveBeenCalledWith('privacy');
  });

  it('renders German UI with concise natural German copy', async () => {
    currentState = {
      mode: 'free',
      uiState: 'FREE',
      trialCreditsRemaining: 0,
      trialStarted: false,
      inlineFixEnabled: false,
      isAppStore: true,
    };

    render(<ProPanel bridge={mockBridge} isRTL={false} lang="de" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('start-trial-button')).toHaveTextContent('25 Fixes kostenlos testen');
    expect(screen.getByTestId('unlock-pro-button-free')).toHaveTextContent('Pro Lifetime freischalten • $4.99');
    expect(screen.getByTestId('restore-purchases-button-main')).toHaveTextContent('Käufe wiederherstellen');
  });

  describe('Real Purchase Flow (StoreKit 2)', () => {
    beforeEach(() => {
      currentState = {
        mode: 'free',
        uiState: 'FREE',
        trialCreditsRemaining: 0,
        trialStarted: false,
        inlineFixEnabled: true,
        isAppStore: true,
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

    it('renders dynamic localized display price from StoreKit on purchase button', async () => {
      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const buyBtn = screen.getByTestId('purchase-pro-button');
      expect(buyBtn).toHaveTextContent('Unlock Pro Lifetime • $4.99');
    });

    it('handles verified successful purchase: unlocks Pro, shows success toast', async () => {
      const onStatusChange = vi.fn();
      mockBridge.purchasePro = vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'paid',
          uiState: 'PAID',
          trialCreditsRemaining: 0,
          trialStarted: true,
          inlineFixEnabled: true,
          isAppStore: true,
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

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" onStatusChange={onStatusChange} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
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

    it('handles user cancellation without error banner or state change', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({ status: 'CANCELLED' });

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
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
      expect(screen.getByText('KeyFixer Pro Lifetime')).toBeInTheDocument();
    });

    it('handles pending purchase with localized approval banner', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({ status: 'PENDING' });

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
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

    it('handles purchase failure with localized error message', async () => {
      mockBridge.purchasePro = vi.fn().mockResolvedValue({
        status: 'FAILED',
        errorMessage: 'Card declined',
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      fireEvent.click(screen.getByTestId('unlock-pro-button-free'));
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
    });
  });

  describe('Restore Purchases Flow', () => {
    it('handles RESTORED: unlocks Pro, displays success toast', async () => {
      const onStatusChange = vi.fn();
      mockBridge.restorePurchases = vi.fn().mockImplementation(async () => {
        currentState = {
          mode: 'paid',
          uiState: 'PAID',
          trialCreditsRemaining: 0,
          trialStarted: true,
          inlineFixEnabled: true,
          isAppStore: true,
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

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" onStatusChange={onStatusChange} />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-main');
      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(mockBridge.restorePurchases).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('pro');
      expect(screen.getByTestId('restore-success-toast')).toHaveTextContent('KeyFixer Pro restored');
    });

    it('handles NOT_FOUND: displays localized info message without error banner', async () => {
      mockBridge.restorePurchases = vi.fn().mockResolvedValue({
        status: 'NOT_FOUND',
        entitlement: { paid: false, verificationStatus: 'NOT_PURCHASED' },
      });

      render(<ProPanel bridge={mockBridge} isRTL={false} lang="en" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      const restoreBtn = screen.getByTestId('restore-purchases-button-main');
      await act(async () => {
        fireEvent.click(restoreBtn);
        await vi.advanceTimersByTimeAsync(50);
      });

      expect(screen.getByTestId('restore-info-banner')).toHaveTextContent('No KeyFixer Pro purchase was found for this Apple Account.');
    });
  });
});
