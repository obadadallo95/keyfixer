/// <reference types="vite/client" />
import React from 'react';
import { ProRuntimeBridge, ProPanelProps } from './contracts';
import { FreeProBridge } from './fallback';

import { ProductionProBridge, ProPanel as RealProPanel } from './provider';

export const isProBuildAvailable = Boolean(import.meta.env.VITE_PRO_BUILD === 'true');

export function getProBridge(): ProRuntimeBridge {
  if (isProBuildAvailable) {
    return ProductionProBridge;
  }
  return FreeProBridge;
}

export function getProPanel(): React.ComponentType<ProPanelProps> | null {
  if (isProBuildAvailable) {
    return RealProPanel;
  }
  return null;
}
