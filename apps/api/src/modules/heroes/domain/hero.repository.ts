import type {
  PaginatedResult,
  PaginationParams,
} from '../../../shared/domain/pagination.js';
import type { Hero } from './hero.js';

export interface FindHeroesParams extends PaginationParams {
  search?: string;
  /** Sem valor, a listagem traz ativos e inativos. */
  isActive?: boolean;
}

export abstract class HeroRepository {
  abstract save(hero: Hero): Promise<void>;

  abstract findById(id: string): Promise<Hero | null>;

  abstract findMany(params: FindHeroesParams): Promise<PaginatedResult<Hero>>;
}
