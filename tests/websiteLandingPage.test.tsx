// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import App from '../src/App';
import { DOWNLOAD_LINKS } from '../src/components/DownloadSection';
import { convertKeyboardLayout } from '../src/core/keyboard';

// Mock Tauri modules if any are used in the web component
vi.mock('@tauri-apps/api/event', () => ({
  __esModule: true,
  listen: vi.fn().mockResolvedValue(() => {}),
}));

vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  __esModule: true,
  readText: vi.fn().mockResolvedValue(''),
  writeText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tauri-apps/api/core', () => ({
  __esModule: true,
  invoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@vercel/analytics/react', () => ({
  __esModule: true,
  Analytics: () => null,
}));

describe('KeyFixer Redesigned Website & Mac App Store Launch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Mac App Store official announcement and links', () => {
    const { getAllByRole, getByText } = render(<App isDesktop={false} />);
    
    // Check announcement banner presence
    expect(getByText(/KeyFixer is now officially live on the Mac App Store/i)).toBeDefined();

    // Check that Mac App Store links point to the official link
    const links = getAllByRole('link');
    const macLinks = links.filter(l => l.getAttribute('href') === DOWNLOAD_LINKS.macAppStore);
    expect(macLinks.length).toBeGreaterThanOrEqual(2);
    expect(DOWNLOAD_LINKS.macAppStore).toContain('id6796866841');
  });

  it('renders official platform links for Windows, Chrome, and GitHub', () => {
    const { getAllByRole } = render(<App isDesktop={false} />);
    const links = getAllByRole('link');
    
    const msLinks = links.filter(l => l.getAttribute('href') === DOWNLOAD_LINKS.microsoftStore);
    expect(msLinks.length).toBeGreaterThanOrEqual(1);

    const chromeLinks = links.filter(l => l.getAttribute('href') === DOWNLOAD_LINKS.chromeWebStore);
    expect(chromeLinks.length).toBeGreaterThanOrEqual(1);

    const githubLinks = links.filter(l => l.getAttribute('href') === DOWNLOAD_LINKS.githubReleases);
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('allows clicking Quick Try presets to populate and convert text', () => {
    const { getByText, getByDisplayValue } = render(<App isDesktop={false} />);
    
    // Find preset button
    const presetBtn = getByText('smnd] pn]');
    fireEvent.click(presetBtn);

    // Should populate input and convert text
    expect(getByDisplayValue('smnd] pn]')).toBeDefined();
    const result = convertKeyboardLayout('smnd] pn]', { mode: 'auto', platform: 'mac' });
    expect(getByDisplayValue(result.fixedText)).toBeDefined();
  });

  it('switches languages smoothly to Arabic (RTL) and updates content', () => {
    const { getByTitle, getByText } = render(<App isDesktop={false} />);
    
    // Switch to Arabic
    const langToggle = getByTitle('Toggle Language');
    fireEvent.click(langToggle);

    expect(document.documentElement.dir).toBe('rtl');
    expect(getByText(/تطبيق KeyFixer متاح الآن رسمياً على متجر Apple Mac App Store/i)).toBeDefined();
    expect(getByText(/كتبت باللغة الخاطئة؟/i)).toBeDefined();
  });
});
