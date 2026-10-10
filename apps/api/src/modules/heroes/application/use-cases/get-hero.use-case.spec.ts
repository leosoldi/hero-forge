import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { HeroNotFoundError } from '../../domain/errors/hero-not-found.error.js';
import { GetHeroUseCase } from './get-hero.use-case.js';

describe('GetHeroUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: GetHeroUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new GetHeroUseCase(repository);
  });

  it('returns the hero', async () => {
    const hero = makeHero();
    await repository.save(hero);

    await expect(useCase.execute(hero.id)).resolves.toMatchObject({
      id: hero.id,
      nickname: 'Hulk',
    });
  });

  it('fails when the hero does not exist', async () => {
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      HeroNotFoundError,
    );
  });
});
