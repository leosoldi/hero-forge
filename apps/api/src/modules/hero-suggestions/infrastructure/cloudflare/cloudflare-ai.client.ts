import { AiUnavailableError } from '../../domain/ai-unavailable.error.js';

export interface CloudflareAiConfig {
  accountId: string;
  apiToken: string;
  timeoutMs?: number;
}

interface CloudflareEnvelope<T> {
  success: boolean;
  result?: T;
  errors?: { message: string }[];
}

export class CloudflareAiClient {
  constructor(private readonly config: CloudflareAiConfig) {}

  async run<T>(model: string, input: Record<string, unknown>): Promise<T> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/ai/run/${model}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
      });
    } catch (error) {
      throw new AiUnavailableError(
        error instanceof Error ? error.message : 'network error',
      );
    }

    const envelope = (await response
      .json()
      .catch(() => null)) as CloudflareEnvelope<T> | null;

    if (!response.ok || !envelope?.success || envelope.result === undefined) {
      const reason =
        envelope?.errors?.map((error) => error.message).join('; ') ||
        `HTTP ${response.status}`;
      throw new AiUnavailableError(reason);
    }

    return envelope.result;
  }
}
