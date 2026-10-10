import type { Hero } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';
import { findHeroOrFail } from '../find-hero-or-fail.js';

export class ActivateHeroUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  async execute(id: string): Promise<Hero> {
    const hero = await findHeroOrFail(this.heroRepository, id);

    hero.activate();
    await this.heroRepository.save(hero);

    return hero;
  }
}
