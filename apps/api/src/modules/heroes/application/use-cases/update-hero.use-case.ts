import type { Hero, HeroData } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';
import { findHeroOrFail } from '../find-hero-or-fail.js';

export type UpdateHeroInput = Partial<HeroData>;

export class UpdateHeroUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  async execute(id: string, input: UpdateHeroInput): Promise<Hero> {
    const hero = await findHeroOrFail(this.heroRepository, id);

    hero.update(input);
    await this.heroRepository.save(hero);

    return hero;
  }
}
