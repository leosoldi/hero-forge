import type { Hero, PaginatedHeroes } from '../../src/features/heroes/types';

let sequence = 0;

export function buildHero(overrides: Partial<Hero> = {}): Hero {
  sequence += 1;

  return {
    id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
    name: 'Robert Bruce Banner',
    nickname: `Hulk ${sequence}`,
    date_of_birth: '1962-04-10 00:00:00',
    universe: 'Marvel',
    main_power: 'Force',
    avatar_url: 'https://example.com/hulk.jpg',
    is_active: true,
    created_at: '2024-09-18 21:41:43',
    updated_at: '2024-09-18 21:41:43',
    ...overrides,
  };
}

export function buildPage(
  heroes: Hero[],
  { page = 1, limit = 10, total = heroes.length } = {},
): PaginatedHeroes {
  return {
    data: heroes,
    meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
