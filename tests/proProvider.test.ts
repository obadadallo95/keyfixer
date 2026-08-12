import { beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke } = vi.hoisted(() => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@tauri-apps/api/core', () => ({ invoke }));

import { ProductionProBridge } from '../src/pro/provider';

describe('ProductionProBridge Inline Fix response', () => {
  beforeEach(() => invoke.mockClear());

  it('uses Tauri camelCase for the Rust fixed_text argument', async () => {
    await ProductionProBridge.submitConversionResponse(17, 'converted', true);

    expect(invoke).toHaveBeenCalledWith('submit_conversion_response', {
      id: 17,
      fixedText: 'converted',
      soundEnabled: true,
    });
  });
});
