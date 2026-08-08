import { ProRuntimeBridge, ProStateDto } from './contracts';

export const FREE_STATE: ProStateDto = {
  mode: 'free',
  uiState: 'FREE',
  trialCreditsRemaining: 0,
  trialStarted: false,
  inlineFixEnabled: false,
};

/** Used in non-Pro builds (free/appstore). All operations are no-ops. */
export const FreeProBridge: ProRuntimeBridge = {
  async getProState() { return FREE_STATE; },
  async activateTrial() { return false; },
  async setInlineFixPreference(_enabled: boolean) {},
  async checkAccessibility() { return true; },
  async openAccessibilitySettings() {},
  async submitConversionResponse(_id: number, _text: string) {},
};
