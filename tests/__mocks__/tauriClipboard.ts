import { vi } from 'vitest';

export const readText = vi.fn().mockResolvedValue('hgpl]');
export const writeText = vi.fn().mockResolvedValue(undefined);
