declare module '*pro-private/frontend/provider.ts' {
  import React from 'react';
  import { ProRuntimeBridge, ProPanelProps } from './contracts';
  export const ProProvider: ProRuntimeBridge;
  export const ProPanel: React.ComponentType<ProPanelProps> | undefined;
}
