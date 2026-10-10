import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { HeroAlreadyInactiveError } from '../../domain/errors/hero-already-inactive.error.js';
import { HeroNotFoundError } from '../../domain/errors/hero-not-found.error.js';
import { DeactivateHeroUseCase } from './deactivate-hero.use-case.js';

describe('DeactivateHeroUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: DeactivateHeroUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new DeactivateHeroUseCase(repository);
  });

  it('deactivates the hero without removing it', async () => {
    const hero = makeHero();
    await repository.save(hero);

    const result = await useCase.execute(hero.id);

    expect(result.isActive).toBe(false);
    expect((await repository.findById(hero.id))?.isActive).toBe(false);
  });

  it('fails when the hero does not exist', async () => {
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      HeroNotFoundError,
    );
  });

  it('fails when the hero is already inactive', async () => {
    const hero = makeHero({}, { active: false });
    await repository.save(hero);

    await expect(useCase.execute(hero.id)).rejects.toThrow(
      HeroAlreadyInactiveError,
    );
  });
});
