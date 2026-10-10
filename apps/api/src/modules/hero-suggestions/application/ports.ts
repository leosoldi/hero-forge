import type { GeneratedImage, HeroIdea } from '../domain/hero-idea.js';

export abstract class HeroIdeaGenerator {
  abstract generate(idea?: string): Promise<HeroIdea>;
}

export abstract class AvatarGenerator {
  abstract generate(prompt: string, seed: string): Promise<GeneratedImage>;
}
