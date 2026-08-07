(window as any).__TAURI_INTERNALS__ = {
  invoke: () => Promise.resolve(),
  transformCallback: () => 1,
  unregisterListener: () => Promise.resolve(),
};
(globalThis as any).__TAURI_INTERNALS__ = (window as any).__TAURI_INTERNALS__;
