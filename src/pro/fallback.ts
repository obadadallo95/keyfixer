import { ProAccessState, ProRuntimeBridge } from './contracts';

export const freeAccessState: ProAccessState = {
  tier: 'free',
  inlineFixAvailable: false,
};

export const FreeProBridge: ProRuntimeBridge = {
  async getAccessState() {
    return freeAccessState;
  },
  async setInlineFixEnabled(_enabled: boolean) {
    return false;
  },
  async getInlineFixEnabled() {
    return false;
  },
  async checkAccessibility() {
    return true;
  },
  async openAccessibilitySettings() {
    // no-op for free build
  },
  async submitConversionResponse(_id: number, _text: string) {
    // no-op for free build
  },
};
