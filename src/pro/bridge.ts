/// <reference types="vite/client" />
import React from 'react';
import { ProRuntimeBridge, ProPanelProps } from './contracts';
import { FreeProBridge } from './fallback';

// Safely probe for optional pro-private module at build time
const proModules = import.meta.glob<{
  ProProvider?: ProRuntimeBridge;
  ProductionProBridge?: ProRuntimeBridge;
  ProPanel?: React.ComponentType<ProPanelProps>;
}>(
  '../../pro-private/frontend/provider.ts',
  { eager: true }
);

const proPath = '../../pro-private/frontend/provider.ts';
const loadedProModule = proModules[proPath];
const activeBridge = loadedProModule?.ProductionProBridge || loadedProModule?.ProProvider;

export const isProBuildAvailable = Boolean(
  import.meta.env.VITE_PRO_BUILD === 'true' && loadedProModule && activeBridge
);

export function getProBridge(): ProRuntimeBridge {
  if (isProBuildAvailable && activeBridge) {
    return activeBridge;
  }
  return FreeProBridge;
}

export function getProPanel(): React.ComponentType<ProPanelProps> | null {
  if (isProBuildAvailable && loadedProModule?.ProPanel) {
    return loadedProModule.ProPanel;
  }
  return null;
}
