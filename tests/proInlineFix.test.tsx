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
});
