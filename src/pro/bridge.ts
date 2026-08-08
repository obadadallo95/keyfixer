/// <reference types="vite/client" />
import React from 'react';
import { ProRuntimeBridge, ProPanelProps } from './contracts';
import { FreeProBridge } from './fallback';

// Safely probe for optional pro-private module at build time
const proModules = import.meta.glob<{
  ProProvider?: ProRuntimeBridge;
  ProPanel?: React.ComponentType<ProPanelProps>;
}>(
  '../../pro-private/frontend/provider.ts',
  { eager: true }
);

const proPath = '../../pro-private/frontend/provider.ts';
const loadedProModule = proModules[proPath];

export const isProBuildAvailable = Boolean(
  loadedProModule && loadedProModule.ProProvider
);

export function getProBridge(): ProRuntimeBridge {
  if (isProBuildAvailable && loadedProModule?.ProProvider) {
    return loadedProModule.ProProvider;
  }
  return FreeProBridge;
}

export function getProPanel(): React.ComponentType<ProPanelProps> | null {
  if (isProBuildAvailable && loadedProModule?.ProPanel) {
    return loadedProModule.ProPanel;
  }
  return null;
}
