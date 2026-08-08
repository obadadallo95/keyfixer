// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { LegalViewerModal } from '../src/components/LegalViewerModal';
import { LEGAL_DOCUMENTS } from '../src/legal/legalContent';

vi.mock('@tauri-apps/api/core', () => ({
  __esModule: true,
  invoke: vi.fn().mockResolvedValue(undefined),
}));

describe('LegalViewerModal and Legal Package Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly when open in English with default privacy doc', () => {
    render(
      <LegalViewerModal
        isOpen={true}
        onClose={vi.fn()}
        initialDoc="privacy"
        lang="en"
        isDark={true}
      />
    );

    // Header title
    expect(screen.getByText('Legal')).toBeDefined();
    // Tab labels in English
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Terms of Use')).toBeDefined();
    expect(screen.getByText('Purchase & Refund Policy')).toBeDefined();
    expect(screen.getByText('Legal Notice')).toBeDefined();
    expect(screen.getByText('Accessibility & Permissions')).toBeDefined();

    // Content of Privacy Policy
    expect(screen.getByText(/KeyFixer is a keyboard layout correction utility for macOS/i)).toBeDefined();
    expect(screen.getAllByText(/obada.dallo95@gmail.com/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders correctly in Arabic with RTL orientation and Arabic labels', () => {
    const { container } = render(
      <LegalViewerModal
        isOpen={true}
        onClose={vi.fn()}
        initialDoc="privacy"
        lang="ar"
        isDark={true}
      />
    );

    // Check RTL
    const modalRoot = container.querySelector('[dir="rtl"]');
    expect(modalRoot).not.toBeNull();

    // Header title in Arabic
    expect(screen.getByText('القانونية')).toBeDefined();
    // Tab labels in Arabic
    expect(screen.getAllByText('سياسة الخصوصية').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('شروط الاستخدام')).toBeDefined();
    expect(screen.getByText('سياسة الشراء والاسترجاع')).toBeDefined();
    expect(screen.getByText('المعلومات القانونية')).toBeDefined();
    expect(screen.getByText('الأذونات وتسهيلات الاستخدام')).toBeDefined();

    // Content of Arabic Privacy Policy
    expect(screen.getByText(/تتم جميع عمليات معالجة وتحويل النصوص محلياً بالكامل/i)).toBeDefined();
    expect(screen.getAllByText(/عبادة دللو/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches between legal tabs smoothly', () => {
    render(
      <LegalViewerModal
        isOpen={true}
        onClose={vi.fn()}
        initialDoc="privacy"
        lang="en"
        isDark={true}
      />
    );

    // Switch to Terms of Use
    fireEvent.click(screen.getByText('Terms of Use'));
    expect(screen.getByText(/KeyFixer Pro Lifetime is a one-time purchase with no recurring subscription fees/i)).toBeDefined();

    // Switch to Purchase & Refund Policy
    fireEvent.click(screen.getByText('Purchase & Refund Policy'));
    expect(screen.getByText(/com.obadadallo.keyfixer.pro.lifetime/i)).toBeDefined();
    expect(screen.getByText(/Refund requests for Mac App Store purchases are handled by Apple/i)).toBeDefined();

    // Switch to Legal Notice (Impressum)
    fireEvent.click(screen.getByText('Legal Notice'));
    expect(screen.getByText(/Augsburger Straße 7/i)).toBeDefined();
    expect(screen.getByText(/09126 Chemnitz/i)).toBeDefined();

    // Switch to Accessibility & Permissions
    fireEvent.click(screen.getByText('Accessibility & Permissions'));
    expect(screen.getByText(/Why KeyFixer needs Accessibility access/i)).toBeDefined();
  });

  it('renders statutory German Impressum in Arabic mode with English toggle', () => {
    render(
      <LegalViewerModal
        isOpen={true}
        onClose={vi.fn()}
        initialDoc="impressum"
        lang="ar"
        isDark={true}
      />
    );

    // German statutory text should be visible by default for Legal Notice in Arabic mode
    expect(screen.getByText(/Angaben gemäß § 5 Digitale-Dienste-Gesetz/i)).toBeDefined();
    expect(screen.getByText(/Augsburger Straße 7/i)).toBeDefined();

    // Check English toggle button
    const toggleBtn = screen.getByText('English version');
    expect(toggleBtn).toBeDefined();
    fireEvent.click(toggleBtn);

    // Now English version should be displayed
    expect(screen.getByText(/Information pursuant to § 5 German Digital Services Act/i)).toBeDefined();
  });

  it('calls onClose when close or done button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <LegalViewerModal
        isOpen={true}
        onClose={handleClose}
        initialDoc="privacy"
        lang="en"
        isDark={true}
      />
    );

    // Click Done button in footer
    fireEvent.click(screen.getByText('Done'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('verifies that internal app-review-notes.md is NEVER exposed in the legal package', () => {
    // Assert that 'app-review-notes' is not a valid or exposed LegalDocId
    const exposedKeys = Object.keys(LEGAL_DOCUMENTS);
    expect(exposedKeys).not.toContain('app-review-notes');
    expect(exposedKeys).not.toContain('app_review_notes');
    expect(exposedKeys).toEqual(['privacy', 'terms', 'purchase-refund', 'impressum', 'accessibility']);
  });
});
