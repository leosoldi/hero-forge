import type { PaginatedResult } from '../../src/shared/domain/pagination.js';
import { Hero } from '../../src/modules/heroes/domain/hero.js';
import {
  type FindHeroesParams,
  HeroRepository,
} from '../../src/modules/heroes/domain/hero.repository.js';

export class InMemoryHeroRepository extends HeroRepository {
  private readonly heroes = new Map<string, Hero>();

  async save(hero: Hero): Promise<void> {
    this.heroes.set(hero.id, clone(hero));
  }

  async findById(id: string): Promise<Hero | null> {
    const hero = this.heroes.get(id);
    return hero ? clone(hero) : null;
  }

  async findMany({
    page,
    limit,
    search,
  }: FindHeroesParams): Promise<PaginatedResult<Hero>> {
    const term = search?.toLowerCase();

    const matches = [...this.heroes.values()]
      .filter(
        (hero) =>
          !term ||
          hero.name.toLowerCase().includes(term) ||
          hero.nickname.toLowerCase().includes(term),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      items: matches.slice((page - 1) * limit, page * limit).map(clone),
      total: matches.length,
      page,
      limit,
    };
  }

  get size(): number {
    return this.heroes.size;
  }
}

function clone(hero: Hero): Hero {
  return Hero.restore({
    id: hero.id,
    name: hero.name,
    nickname: hero.nickname,
    dateOfBirth: hero.dateOfBirth,
    universe: hero.universe,
    mainPower: hero.mainPower,
    avatarUrl: hero.avatarUrl,
    isActive: hero.isActive,
    createdAt: hero.createdAt,
    updatedAt: hero.updatedAt,
  });
}
