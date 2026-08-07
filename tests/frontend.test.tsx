// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ConverterArea } from '../src/components/ConverterArea';
import React from 'react';

// Mock Tauri APIs
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event, cb) => {
    if (event === 'shortcut-pressed') {
      (global as any).fireShortcut = cb;
    }
    return Promise.resolve(() => {});
  }),
}));

vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  readText: vi.fn().mockResolvedValue('hgpl]'),
  writeText: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

describe('ConverterArea Frontend State Machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<ConverterArea lang="en" isDesktop={true} />);
    expect(getByPlaceholderText(/Example/i)).toBeDefined();
  });

});
