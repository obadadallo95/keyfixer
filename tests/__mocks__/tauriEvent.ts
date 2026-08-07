import { vi } from 'vitest';

export const listen = vi.fn((event, cb) => {
  if (event === 'shortcut-pressed') {
    (globalThis as any).fireShortcut = cb;
  }
  if (event === 'tauri://focus') {
    (globalThis as any).fireFocus = cb;
  }
  return Promise.resolve(() => {});
});
