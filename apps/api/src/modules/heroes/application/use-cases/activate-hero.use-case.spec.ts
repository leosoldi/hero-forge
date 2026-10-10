import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { HeroAlreadyActiveError } from '../../domain/errors/hero-already-active.error.js';
import { HeroNotFoundError } from '../../domain/errors/hero-not-found.error.js';
import { ActivateHeroUseCase } from './activate-hero.use-case.js';

describe('ActivateHeroUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: ActivateHeroUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new ActivateHeroUseCase(repository);
  });

  it('reactivates an inactive hero', async () => {
    const hero = makeHero({}, { active: false });
    await repository.save(hero);

    const result = await useCase.execute(hero.id);

    expect(result.isActive).toBe(true);
    expect((await repository.findById(hero.id))?.isActive).toBe(true);
  });

  it('fails when the hero does not exist', async () => {
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      HeroNotFoundError,
    );
  });

  it('fails when the hero is already active', async () => {
    const hero = makeHero();
    await repository.save(hero);

    await expect(useCase.execute(hero.id)).rejects.toThrow(
      HeroAlreadyActiveError,
    );
  });
});
