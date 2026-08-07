declare module '*pro-private/frontend/provider.ts' {
  import React from 'react';
  import { ProRuntimeBridge } from './contracts';
  export const ProProvider: ProRuntimeBridge;
  export const ProPanel: React.ComponentType<{ bridge: ProRuntimeBridge }> | undefined;
}
