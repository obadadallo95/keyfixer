// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import { ConverterArea } from '../src/components/ConverterArea';
import React from 'react';

vi.mock('@tauri-apps/api/event', () => ({
  __esModule: true,
  listen: vi.fn().mockResolvedValue(() => {})
}));

vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  __esModule: true,
  readText: vi.fn().mockResolvedValue('hgpl]'),
  writeText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tauri-apps/api/core', () => ({
  __esModule: true,
  invoke: vi.fn().mockResolvedValue(undefined),
}));

// Tauri APIs are mocked via vi.mock

import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';

describe('ConverterArea Frontend State Machine', () => {
  beforeEach(() => {
    const tauriInternals = {
      invoke: vi.fn(),
      transformCallback: vi.fn().mockReturnValue(1),
      unregisterListener: vi.fn(),
    };
    (window as any).__TAURI_INTERNALS__ = tauriInternals;
    (globalThis as any).__TAURI_INTERNALS__ = tauriInternals;
    
    vi.clearAllMocks();
  });

  const getShortcutCallback = () => {
    const calls = (listen as any).mock.calls;
    const call = calls.find((c: any) => c[0] === 'shortcut-pressed');
    return call ? call[1] : undefined;
  };

  const getFocusCallback = () => {
    const calls = (listen as any).mock.calls;
    const call = calls.find((c: any) => c[0] === 'tauri://focus');
    return call ? call[1] : undefined;
  };

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<ConverterArea lang="en" isDesktop={true} />);
    expect(getByPlaceholderText(/Example/i)).toBeDefined();
  });

  it('transitions from Idle -> ResultReady after shortcut + clipboard read', async () => {
    (readText as any).mockResolvedValueOnce('hgpl]');
    const { getByDisplayValue } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => {
      expect(getShortcutCallback()).toBeDefined();
    });

    await act(async () => {
      await getShortcutCallback()();
    });

    // Should read clipboard and populate input and output
    expect(readText).toHaveBeenCalled();
    // 'hgpl]' should be converted to 'الحمة'
    await waitFor(() => {
      expect(getByDisplayValue('hgpl]')).toBeDefined();
      expect(getByDisplayValue('الحمة')).toBeDefined();
    });
  });

  it('transitions ResultReady -> copy -> hide -> Idle on second shortcut', async () => {
    (readText as any).mockResolvedValueOnce('hgpl]');
    const { queryByDisplayValue, container } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    // First shortcut (Idle -> ResultReady)
    await act(async () => {
      await getShortcutCallback()();
    });

    // Second shortcut (ResultReady -> Idle)
    await act(async () => {
      await getShortcutCallback()();
    });

    expect(writeText).toHaveBeenCalledWith('الحمة');
    
    // Expect glow class to be present
    expect(container.firstChild).toHaveProperty('className');
    expect((container.firstChild as HTMLElement).className).toContain('shadow-[0_0_30px_rgba(245,158,11,0.4)]');
    
    vi.useFakeTimers();
    // Fast forward timeouts
    act(() => {
      vi.advanceTimersByTime(400);
    });
    vi.useRealTimers();

    // State is reset to Idle (inputs cleared)
    await waitFor(() => {
      expect(queryByDisplayValue('hgpl]')).toBeNull();
      expect(queryByDisplayValue('الحمة')).toBeNull();
      expect(invoke).toHaveBeenCalledWith('hide_window');
    });
  });

  it('handles empty clipboard fallback safely', async () => {
    (readText as any).mockResolvedValueOnce('   '); // empty/whitespace
    const { queryByDisplayValue } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    await act(async () => {
      await getShortcutCallback()();
    });

    // Should not populate text
    expect(queryByDisplayValue('   ')).toBeNull();
  });

  it('handles clipboard read denied smoothly', async () => {
    (readText as any).mockRejectedValueOnce(new Error('Permission denied'));
    const { getByPlaceholderText } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    await act(async () => {
      await getShortcutCallback()();
    });

    // Input is focused as fallback (we check if it renders fine without crashing)
    expect(getByPlaceholderText(/Example/i)).toBeDefined();
  });

  it('handles clipboard write failure without clearing state', async () => {
    (readText as any).mockResolvedValueOnce('hgpl]');
    (writeText as any).mockRejectedValueOnce(new Error('Write failed'));
    
    const { getByDisplayValue } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    // Enter ResultReady
    await act(async () => {
      await getShortcutCallback()();
    });

    // Trigger Write failure
    await act(async () => {
      await getShortcutCallback()();
    });

    expect(writeText).toHaveBeenCalled();
    vi.useFakeTimers();
    // Fast-forward to make sure we don't clear state on failure
    act(() => {
      vi.advanceTimersByTime(400);
    });
    vi.useRealTimers();

    // Should still have text
    expect(getByDisplayValue('hgpl]')).toBeDefined();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('prevents rapid double-presses from running concurrently', async () => {
    (readText as any).mockResolvedValue('hgpl]');
    render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    // Fire shortcut multiple times rapidly before first one resolves
    act(() => {
      getShortcutCallback()();
      getShortcutCallback()();
      getShortcutCallback()();
    });

    // Resolving promises
    await act(async () => {
      await Promise.resolve();
    });

    // Because of the isProcessingShortcut lock, readText should only be called once
    expect(readText).toHaveBeenCalledTimes(1);
  });

  it('allows same-text conversion to proceed normally', async () => {
    // English text that isn't changed by conversion
    (readText as any).mockResolvedValueOnce('hello');
    const { getByDisplayValue } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());

    await act(async () => {
      await getShortcutCallback()();
    });

    expect(getByDisplayValue('hello')).toBeDefined(); // input
    
    // Then we fire again to accept
    await act(async () => {
      await getShortcutCallback()();
    });

    expect(writeText).toHaveBeenCalled();
  });

  it('does not clear input on blur (stale text remains)', () => {
    const { getByPlaceholderText, getByDisplayValue } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    const textarea = getByPlaceholderText(/Example/i);
    
    act(() => {
      fireEvent.change(textarea, { target: { value: 'some text' } });
    });
    
    expect(getByDisplayValue('some text')).toBeDefined();
    
    act(() => {
      fireEvent.blur(textarea);
    });
    
    // Should NOT clear text
    expect(getByDisplayValue('some text')).toBeDefined();
  });

  it('does not accidentally accept stale output on manual tray open', async () => {
    const { getByPlaceholderText } = render(<ConverterArea lang="en" isDesktop={true} />);
    
    const textarea = getByPlaceholderText(/Example/i);
    
    act(() => {
      fireEvent.change(textarea, { target: { value: 'stale text' } });
    });
    
    await waitFor(() => expect(getFocusCallback()).toBeDefined());

    // Manual focus event (e.g. from tray)
    await act(async () => {
      await getFocusCallback()();
    });
    
    // Just ensures no writeText or hide_window is called automatically
    expect(writeText).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('registers exactly ONE shortcut-pressed listener to prevent duplicate events', async () => {
    render(<ConverterArea lang="en" isDesktop={true} />);
    
    await waitFor(() => expect(getShortcutCallback()).toBeDefined());
    
    const shortcutCalls = (listen as any).mock.calls.filter((c: any) => c[0] === 'shortcut-pressed');
    expect(shortcutCalls.length).toBe(1);
  });
});
