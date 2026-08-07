export type ProTier = 'free' | 'trial' | 'pro';

export interface ProAccessState {
  tier: ProTier;
  inlineFixAvailable: boolean;
}

export interface ProRuntimeBridge {
  getAccessState: () => Promise<ProAccessState>;
  setInlineFixEnabled: (enabled: boolean) => Promise<boolean>;
  getInlineFixEnabled: () => Promise<boolean>;
  checkAccessibility: () => Promise<boolean>;
  openAccessibilitySettings: () => Promise<void>;
  submitConversionResponse: (id: number, text: string) => Promise<void>;
}
