import { makeHero } from '@test/support/hero.factory.js';
import { HeroPresenter } from './hero.presenter.js';

describe('HeroPresenter', () => {
  const now = new Date('2024-09-18T21:41:43.456Z');

  it('formats the hero exactly as the API contract', () => {
    const hero = makeHero(
      {},
      { id: 'e314636e-1ca6-4925-a0e7-da5eb5ae2403', now },
    );

    expect(HeroPresenter.toHttp(hero)).toEqual({
      id: 'e314636e-1ca6-4925-a0e7-da5eb5ae2403',
      name: 'Robert Bruce Banner',
      nickname: 'Hulk',
      date_of_birth: '1962-04-10 00:00:00',
      universe: 'Marvel',
      main_power: 'Force',
      avatar_url: 'https://example.com/hulk.jpg',
      is_active: true,
      created_at: '2024-09-18 21:41:43',
      updated_at: '2024-09-18 21:41:43',
    });
  });

  it('wraps a page of heroes with pagination metadata', () => {
    const result = HeroPresenter.toPaginatedHttp({
      items: [makeHero({}, { now })],
      page: 2,
      limit: 10,
      total: 21,
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      total_pages: 3,
    });
  });

  it('reports zero pages when there are no heroes', () => {
    const result = HeroPresenter.toPaginatedHttp({
      items: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    expect(result.meta.total_pages).toBe(0);
  });
});
