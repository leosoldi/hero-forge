import type { PaginatedResult } from '../../../shared/domain/pagination.js';
import {
  formatDateOnly,
  formatDateTime,
} from '../../../shared/presentation/date-format.js';
import type { Hero } from '../domain/hero.js';
import type { HeroResponse, PaginatedHeroesResponse } from './hero.response.js';

export class HeroPresenter {
  static toHttp(hero: Hero): HeroResponse {
    return {
      id: hero.id,
      name: hero.name,
      nickname: hero.nickname,
      date_of_birth: formatDateOnly(hero.dateOfBirth),
      universe: hero.universe,
      main_power: hero.mainPower,
      avatar_url: hero.avatarUrl,
      is_active: hero.isActive,
      created_at: formatDateTime(hero.createdAt),
      updated_at: formatDateTime(hero.updatedAt),
    };
  }

  static toPaginatedHttp(
    result: PaginatedResult<Hero>,
  ): PaginatedHeroesResponse {
    return {
      data: result.items.map((hero) => HeroPresenter.toHttp(hero)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
