// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { LegalPage } from '../src/components/LegalPage';
import { DeveloperCredit } from '../src/components/DeveloperCredit';
import { LEGAL_DOCUMENTS } from '../src/legal/legalContent';

describe('KeyFixer Website Public Legal Routes (TASK 8D)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('/privacy loads Privacy Policy correctly in English and Arabic', () => {
    // English LTR
    render(<LegalPage initialDocId="privacy" />);
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/KeyFixer is a keyboard layout correction utility for macOS/i)).toBeDefined();
    expect(document.title).toBe('KeyFixer – Privacy Policy');

    // Toggle to Arabic RTL
    fireEvent.click(screen.getByTitle('Toggle Language'));
    expect(screen.getAllByText('سياسة الخصوصية').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/تتم جميع عمليات معالجة وتحويل النصوص محلياً بالكامل/i)).toBeDefined();
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.title).toBe('KeyFixer – سياسة الخصوصية');
  });

  it('/terms loads Terms of Use correctly in English and Arabic', () => {
    render(<LegalPage initialDocId="terms" />);
    expect(screen.getAllByText('Terms of Use').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/KeyFixer Pro Lifetime is a one-time purchase with no recurring subscription fees/i)).toBeDefined();
    expect(document.title).toBe('KeyFixer – Terms of Use');

    // Toggle to Arabic
    fireEvent.click(screen.getByTitle('Toggle Language'));
    expect(screen.getAllByText('شروط الاستخدام').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/KeyFixer Pro مدى الحياة هو شراء لمرة واحدة دون رسوم اشتراك متكررة/i)).toBeDefined();
    expect(document.title).toBe('KeyFixer – شروط الاستخدام');
  });

  it('/refund loads Purchase & Refund Policy correctly in English and Arabic', () => {
    render(<LegalPage initialDocId="purchase-refund" />);
    expect(screen.getAllByText('Purchase & Refund Policy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Refund requests for Mac App Store purchases are handled by Apple/i)).toBeDefined();
    expect(screen.getByText(/com.obadadallo.keyfixer.pro.lifetime/i)).toBeDefined();
    expect(document.title).toBe('KeyFixer – Purchase & Refund Policy');

    // Toggle to Arabic
    fireEvent.click(screen.getByTitle('Toggle Language'));
    expect(screen.getAllByText(/سياسة الشراء والاستر/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/تتولى Apple معالجة طلبات استرداد مشتريات Mac App Store/i)).toBeDefined();
    expect(document.title).toBe('KeyFixer – سياسة الشراء والاسترجاع');
  });

  it('/impressum loads Legal Notice / German statutory Impressum correctly with language toggle', () => {
    render(<LegalPage initialDocId="impressum" />);
    // English default on initial load
    expect(screen.getAllByText('Legal Notice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Information pursuant to § 5 German Digital Services Act/i)).toBeDefined();
    expect(screen.getByText(/Augsburger Straße 7/i)).toBeDefined();
    expect(screen.getByText(/09126 Chemnitz/i)).toBeDefined();
    expect(screen.getByText(/obada.dallo95@gmail.com/i)).toBeDefined();

    // Toggle to Arabic UI
    fireEvent.click(screen.getByTitle('Toggle Language'));
    expect(screen.getAllByText('المعلومات القانونية').length).toBeGreaterThanOrEqual(1);
    // In Arabic UI, statutory German Impressum is rendered as primary
    expect(screen.getByText(/Angaben gemäß § 5 Digitale-Dienste-Gesetz/i)).toBeDefined();

    // Toggle to English convenience translation
    const toggleBtn = screen.getByText('English version');
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Information pursuant to § 5 German Digital Services Act/i)).toBeDefined();
  });

  it('/accessibility loads Accessibility & Permission Disclosure correctly', () => {
    render(<LegalPage initialDocId="accessibility" />);
    expect(screen.getAllByText('Accessibility & Permissions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Why KeyFixer needs Accessibility access/i)).toBeDefined();
    expect(screen.getByText(/KeyFixer does not monitor your typing/i)).toBeDefined();

    // Toggle to Arabic
    fireEvent.click(screen.getByTitle('Toggle Language'));
    expect(screen.getAllByText('الأذونات وتسهيلات الاستخدام').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/لماذا يحتاج KeyFixer إلى إذن تسهيلات الاستخدام؟/i)).toBeDefined();
  });

  it('site footer renders all 4 required legal links plus About Developer in English and Arabic', () => {
    // English footer
    const { rerender } = render(<DeveloperCredit lang="en" />);
    expect(screen.getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: 'Terms' }).getAttribute('href')).toBe('/terms');
    expect(screen.getByRole('link', { name: 'Purchase & Refund' }).getAttribute('href')).toBe('/refund');
    expect(screen.getByRole('link', { name: 'Impressum' }).getAttribute('href')).toBe('/impressum');
    expect(screen.getByRole('link', { name: 'About Developer' }).getAttribute('href')).toBe('/about');

    // Arabic footer
    rerender(<DeveloperCredit lang="ar" />);
    expect(screen.getByRole('link', { name: 'الخصوصية' }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: 'الشروط' }).getAttribute('href')).toBe('/terms');
    expect(screen.getByRole('link', { name: 'الشراء والاسترجاع' }).getAttribute('href')).toBe('/refund');
    expect(screen.getByRole('link', { name: 'المعلومات القانونية' }).getAttribute('href')).toBe('/impressum');
    expect(screen.getByRole('link', { name: 'عن المطور' }).getAttribute('href')).toBe('/about');
  });

  it('internal app-review-notes.md is NOT exposed publicly on any route', () => {
    const keys = Object.keys(LEGAL_DOCUMENTS);
    expect(keys).not.toContain('app-review-notes');
    expect(keys).not.toContain('app_review_notes');
    expect(keys.length).toBe(5);
  });
});
