// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@tauri-apps/api/app', () => ({ getVersion: vi.fn().mockResolvedValue('1.3.1') }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ startDragging: vi.fn(), hide: vi.fn() }),
}));
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn().mockResolvedValue(() => {}) }));
vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  readText: vi.fn().mockResolvedValue(''),
  writeText: vi.fn().mockResolvedValue(undefined),
}));

import { DesktopApp } from '../src/components/DesktopApp';

function setDarkMode(dark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe('DesktopApp long-text editor layout', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('keyfixer_ui_language', 'en');
    localStorage.setItem('keyfixer_onboarding_v1_complete', 'true');
    setDarkMode(false);
  });

  afterEach(cleanup);

  it('keeps 1500+ character mixed text inside scrollable, bounded panels', () => {
    const { container } = render(<DesktopApp />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    const longMixedText = `${'English العربية lsgh مرحبا '.repeat(80)}end`;

    fireEvent.change(input, { target: { value: longMixedText } });

    expect(input.value.length).toBeGreaterThan(1500);
    expect(input).toHaveStyle({ overflow: 'auto', minHeight: '0', color: '#1C1C1E' });
    expect(input.style.webkitTextFillColor).toBe('rgb(28, 28, 30)');
    expect(container.querySelector('.kf-main-content')).toHaveStyle({ overflow: 'hidden', minHeight: '0' });
    expect(container.querySelector('.kf-editors')).toHaveStyle({ overflow: 'hidden', minHeight: '0' });
    expect(container.querySelector('.kf-editor-output')).toHaveStyle({ overflowY: 'auto', overflowX: 'hidden' });
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('uses explicit readable colors in dark mode', () => {
    setDarkMode(true);
    render(<DesktopApp />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;

    expect(input).toHaveStyle({ color: 'rgba(255,255,255,0.92)', caretColor: 'rgba(255,255,255,0.92)' });
    expect(input.style.webkitTextFillColor).toBe('rgba(255, 255, 255, 0.92)');
  });
});
