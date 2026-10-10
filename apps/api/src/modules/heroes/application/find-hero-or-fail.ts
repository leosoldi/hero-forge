import { HeroNotFoundError } from '../domain/errors/hero-not-found.error.js';
import type { Hero } from '../domain/hero.js';
import type { HeroRepository } from '../domain/hero.repository.js';

export async function findHeroOrFail(
  repository: HeroRepository,
  id: string,
): Promise<Hero> {
  const hero = await repository.findById(id);

  if (!hero) {
    throw new HeroNotFoundError(id);
  }

  return hero;
}
