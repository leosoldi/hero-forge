import { Hero, type HeroData } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';

export type CreateHeroInput = HeroData;

export class CreateHeroUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  async execute(input: CreateHeroInput): Promise<Hero> {
    const hero = Hero.create(input);

    await this.heroRepository.save(hero);

    return hero;
  }
}
