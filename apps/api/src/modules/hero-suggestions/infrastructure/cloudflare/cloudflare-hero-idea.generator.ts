import { HeroIdeaGenerator } from '../../application/ports.js';
import { AiUnavailableError } from '../../domain/ai-unavailable.error.js';
import type { HeroIdea } from '../../domain/hero-idea.js';
import type { CloudflareAiClient } from './cloudflare-ai.client.js';

const SYSTEM_PROMPT = `Você cria super-heróis ORIGINAIS para uma plataforma de gestão de heróis.
Regras:
- Nunca use personagens, nomes ou marcas existentes (Marvel, DC, anime, games etc.).
- Responda em português do Brasil, exceto "avatarPrompt", que deve ser em inglês.
- "name": nome civil completo e verossímil (até 120 caracteres).
- "nickname": nome de guerra curto e marcante (até 40 caracteres).
- "dateOfBirth": data no formato YYYY-MM-DD, entre 1950 e 2005.
- "universe": nome de um universo fictício original (até 40 caracteres).
- "mainPower": a habilidade principal em poucas palavras (até 60 caracteres).
- "backstory": 2 a 3 frases sobre a origem e o que o herói consegue fazer (até 500 caracteres).
- "avatarPrompt": descrição visual do herói para gerar um retrato (aparência, traje, cores, cenário), sem texto na imagem.`;

const HERO_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    nickname: { type: 'string' },
    dateOfBirth: { type: 'string' },
    universe: { type: 'string' },
    mainPower: { type: 'string' },
    backstory: { type: 'string' },
    avatarPrompt: { type: 'string' },
  },
  required: [
    'name',
    'nickname',
    'dateOfBirth',
    'universe',
    'mainPower',
    'backstory',
    'avatarPrompt',
  ],
};

export class CloudflareHeroIdeaGenerator extends HeroIdeaGenerator {
  constructor(
    private readonly client: CloudflareAiClient,
    private readonly model: string,
  ) {
    super();
  }

  async generate(idea?: string): Promise<HeroIdea> {
    const result = await this.client.run<{ response: unknown }>(this.model, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: idea
            ? `Crie um herói a partir desta ideia: "${idea}"`
            : 'Crie um herói surpresa, com um conceito criativo.',
        },
      ],
      response_format: { type: 'json_schema', json_schema: HERO_SCHEMA },
      max_tokens: 700,
      temperature: 0.9,
    });

    return parseIdea(result.response);
  }
}

function parseIdea(response: unknown): HeroIdea {
  if (typeof response === 'object' && response !== null) {
    return response as HeroIdea;
  }

  if (typeof response === 'string') {
    const json = response.slice(
      response.indexOf('{'),
      response.lastIndexOf('}') + 1,
    );
    try {
      return JSON.parse(json) as HeroIdea;
    } catch {
      throw new AiUnavailableError('the model did not return valid JSON');
    }
  }

  throw new AiUnavailableError('empty answer from the model');
}
