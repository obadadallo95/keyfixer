/// <reference types="vite/client" />
import { ProRuntimeBridge } from './contracts';
import { FreeProBridge } from './fallback';

// Safely probe for optional pro-private module at build time
const proModules = import.meta.glob<{ ProProvider?: ProRuntimeBridge }>(
  '../../pro-private/frontend/provider.ts',
  { eager: true }
);

const proPath = '../../pro-private/frontend/provider.ts';
const loadedProModule = proModules[proPath];

export const isProBuildAvailable = Boolean(
  import.meta.env.VITE_PRO_BUILD === 'true' && loadedProModule && loadedProModule.ProProvider
);

export function getProBridge(): ProRuntimeBridge {
  if (isProBuildAvailable && loadedProModule?.ProProvider) {
    return loadedProModule.ProProvider;
  }
  return FreeProBridge;
}
