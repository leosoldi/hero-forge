import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { HERO_PAGINATION, ListHeroesUseCase } from './list-heroes.use-case.js';

describe('ListHeroesUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: ListHeroesUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new ListHeroesUseCase(repository);
  });

  const seed = async (count: number) => {
    for (let i = 0; i < count; i++) {
      await repository.save(
        makeHero(
          { nickname: `Hero ${i}` },
          { now: new Date(Date.UTC(2026, 0, 1, 0, 0, i)) },
        ),
      );
    }
  };

  it('returns the first page with 10 heroes by default', async () => {
    await seed(12);

    const result = await useCase.execute();

    expect(result).toMatchObject({ page: 1, limit: 10, total: 12 });
    expect(result.items).toHaveLength(10);
  });

  it('returns the most recent heroes first', async () => {
    await seed(3);

    const { items } = await useCase.execute();

    expect(items.map((hero) => hero.nickname)).toEqual([
      'Hero 2',
      'Hero 1',
      'Hero 0',
    ]);
  });

  it('returns the requested page', async () => {
    await seed(12);

    const result = await useCase.execute({ page: 2 });

    expect(result.items.map((hero) => hero.nickname)).toEqual([
      'Hero 1',
      'Hero 0',
    ]);
  });

  it('normalizes invalid pagination values', async () => {
    const findMany = vi.spyOn(repository, 'findMany');

    await useCase.execute({ page: 0, limit: 500 });
    await useCase.execute({ page: -3, limit: 0 });

    expect(findMany).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: HERO_PAGINATION.MAX_LIMIT,
      search: undefined,
    });
    expect(findMany).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 1,
      search: undefined,
    });
  });

  it('trims the search term and ignores blank searches', async () => {
    const findMany = vi.spyOn(repository, 'findMany');

    await useCase.execute({ search: '  hulk ' });
    await useCase.execute({ search: '   ' });

    expect(findMany).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 10,
      search: 'hulk',
    });
    expect(findMany).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 10,
      search: undefined,
    });
  });
});
