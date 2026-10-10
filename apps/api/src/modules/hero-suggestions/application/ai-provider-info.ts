export interface AiProviderInfo {
  provider: 'demo' | 'cloudflare';
  dailyLimit: number | null;
  resetsAtUtc: string | null;
}

export const AI_PROVIDER_INFO = Symbol('AI_PROVIDER_INFO');

export const DEMO_PROVIDER_INFO: AiProviderInfo = {
  provider: 'demo',
  dailyLimit: null,
  resetsAtUtc: null,
};

// Free plan: 10,000 neurons/day. One suggestion (LLM text + FLUX schnell image)
// costs ~60-70 neurons, so ~100 suggestions/day is a conservative estimate.
export const CLOUDFLARE_PROVIDER_INFO: AiProviderInfo = {
  provider: 'cloudflare',
  dailyLimit: 100,
  resetsAtUtc: '00:00',
};
