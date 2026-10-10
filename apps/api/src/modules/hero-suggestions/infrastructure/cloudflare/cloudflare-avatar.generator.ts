import { AvatarGenerator } from '../../application/ports.js';
import { AiUnavailableError } from '../../domain/ai-unavailable.error.js';
import type { GeneratedImage } from '../../domain/hero-idea.js';
import type { CloudflareAiClient } from './cloudflare-ai.client.js';

const STYLE =
  'Original superhero character portrait, upper body, centered, comic book illustration, dramatic lighting, vibrant colors, detailed, no text, no logo, no watermark.';

export class CloudflareAvatarGenerator extends AvatarGenerator {
  constructor(
    private readonly client: CloudflareAiClient,
    private readonly model: string,
  ) {
    super();
  }

  async generate(prompt: string): Promise<GeneratedImage> {
    const result = await this.client.run<{ image?: string }>(this.model, {
      prompt: `${prompt}. ${STYLE}`.slice(0, 2048),
      steps: 4,
    });

    if (!result.image) {
      throw new AiUnavailableError('the image model returned no image');
    }

    return { content: Buffer.from(result.image, 'base64') };
  }
}
