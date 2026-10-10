import { heroData } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { InvalidHeroError } from '../../domain/errors/invalid-hero.error.js';
import { CreateHeroUseCase } from './create-hero.use-case.js';

describe('CreateHeroUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: CreateHeroUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new CreateHeroUseCase(repository);
  });

  it('creates an active hero and persists it', async () => {
    const hero = await useCase.execute(heroData());

    expect(hero.isActive).toBe(true);
    expect(await repository.findById(hero.id)).toMatchObject({
      nickname: 'Hulk',
      isActive: true,
    });
  });

  it('does not persist invalid data', async () => {
    await expect(useCase.execute(heroData({ nickname: '' }))).rejects.toThrow(
      InvalidHeroError,
    );
    expect(repository.size).toBe(0);
  });
});
