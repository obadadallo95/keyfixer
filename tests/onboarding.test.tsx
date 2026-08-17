// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { invoke, listen } = vi.hoisted(() => ({ invoke: vi.fn(), listen: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({ invoke }));
vi.mock('@tauri-apps/api/event', () => ({ listen }));

import { Onboarding, ONBOARDING_STORAGE_KEY } from '../src/components/Onboarding';

describe('first-run onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    invoke.mockReset().mockImplementation((command: string) =>
      command === 'is_launch_at_login_enabled' ? Promise.resolve(false) : Promise.resolve(undefined)
    );
    listen.mockReset().mockResolvedValue(vi.fn());
  });

  it('teaches ⌥⌘K interactively and saves launch-at-login choice (EN)', async () => {
    const onDone = vi.fn();
    render(<Onboarding isRTL={false} lang="en" onDone={onDone} />);

    fireEvent.click(screen.getByText('Next'));
    const demo = screen.getByLabelText('Instant Fix demo') as HTMLInputElement;
    expect(demo).toHaveValue('lnpfh f;');
    demo.select();
    fireEvent.keyUp(window, { code: 'KeyK', altKey: true, metaKey: true });
    expect(demo).toHaveValue('مرحبا بك');
    expect(screen.getByText(/Perfect!/)).toBeInTheDocument();

    const nativeShortcutHandler = listen.mock.calls.find(([event]) => event === 'global-shortcut-k-released')?.[1];
    expect(nativeShortcutHandler).toBeTypeOf('function');
    nativeShortcutHandler();
    expect(demo).toHaveValue('مرحبا بك');

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByLabelText('Launch KeyFixer at login'));
    fireEvent.click(screen.getByText('Start using KeyFixer'));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith('set_launch_at_login', { enabled: true }));
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('renders Arabic onboarding correctly with RTL direction', async () => {
    const onDone = vi.fn();
    render(<Onboarding isRTL={true} lang="ar" onDone={onDone} />);

    expect(screen.getByText('اكتب بلغتك بحرية تامة')).toBeInTheDocument();
    fireEvent.click(screen.getByText('التالي'));
    expect(screen.getByText('التصحيح الفوري بالاختصار')).toBeInTheDocument();
  });

  it('renders German onboarding correctly', async () => {
    const onDone = vi.fn();
    render(<Onboarding isRTL={false} lang="de" onDone={onDone} />);

    expect(screen.getByText('Tippen Sie frei auf Arabisch und Englisch')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Weiter'));
    expect(screen.getByText('Sofort-Korrektur mit Kurzbefehl')).toBeInTheDocument();
  });
});
