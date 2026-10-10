export interface Hero {
  id: string;
  name: string;
  nickname: string;
  date_of_birth: string;
  universe: string;
  main_power: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HeroInput = Pick<
  Hero,
  'name' | 'nickname' | 'universe' | 'main_power' | 'avatar_url'
> & {
  date_of_birth: string;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedHeroes {
  data: Hero[];
  meta: PaginationMeta;
}

export interface ListHeroesParams {
  page: number;
  limit: number;
  search?: string;
}
