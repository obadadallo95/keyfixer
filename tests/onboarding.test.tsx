// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => ({ invoke }));

import { Onboarding, ONBOARDING_STORAGE_KEY } from '../src/components/Onboarding';

describe('first-run onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    invoke.mockReset().mockImplementation((command: string) =>
      command === 'is_launch_at_login_enabled' ? Promise.resolve(false) : Promise.resolve(undefined)
    );
  });

  it('teaches ⌥⌘K interactively and saves launch-at-login choice', async () => {
    const onDone = vi.fn();
    render(<Onboarding isRTL={false} onDone={onDone} />);

    fireEvent.click(screen.getByText('Next'));
    const demo = screen.getByLabelText('Inline Fix demo') as HTMLInputElement;
    demo.select();
    fireEvent.keyDown(window, { code: 'KeyK', altKey: true, metaKey: true });
    expect(screen.getByText(/Perfect!/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByLabelText('Launch KeyFixer at login'));
    fireEvent.click(screen.getByText('Start using KeyFixer'));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith('set_launch_at_login', { enabled: true }));
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(onDone).toHaveBeenCalledOnce();
  });
});
