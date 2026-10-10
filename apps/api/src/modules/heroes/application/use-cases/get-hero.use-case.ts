import type { Hero } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';
import { findHeroOrFail } from '../find-hero-or-fail.js';

export class GetHeroUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  execute(id: string): Promise<Hero> {
    return findHeroOrFail(this.heroRepository, id);
  }
}
