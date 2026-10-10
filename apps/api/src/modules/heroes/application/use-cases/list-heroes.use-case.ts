import type { PaginatedResult } from '../../../../shared/domain/pagination.js';
import type { Hero } from '../../domain/hero.js';
import type { HeroRepository } from '../../domain/hero.repository.js';

export const HERO_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

export interface ListHeroesInput {
  page?: number;
  limit?: number;
  search?: string;
}

export class ListHeroesUseCase {
  constructor(private readonly heroRepository: HeroRepository) {}

  execute(input: ListHeroesInput = {}): Promise<PaginatedResult<Hero>> {
    const page = Math.max(
      HERO_PAGINATION.DEFAULT_PAGE,
      Math.trunc(input.page ?? HERO_PAGINATION.DEFAULT_PAGE),
    );
    const limit = Math.min(
      HERO_PAGINATION.MAX_LIMIT,
      Math.max(1, Math.trunc(input.limit ?? HERO_PAGINATION.DEFAULT_LIMIT)),
    );
    const search = input.search?.trim() || undefined;

    return this.heroRepository.findMany({ page, limit, search });
  }
}
