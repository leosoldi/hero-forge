import type { Hero } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';
import { findHeroOrFail } from '../find-hero-or-fail.js';

export class DeactivateHeroUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  async execute(id: string): Promise<Hero> {
    const hero = await findHeroOrFail(this.heroRepository, id);

    hero.deactivate();
    await this.heroRepository.save(hero);

    return hero;
  }
}
