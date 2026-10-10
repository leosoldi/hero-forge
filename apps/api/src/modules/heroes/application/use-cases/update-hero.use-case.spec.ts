import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import { HeroInactiveError } from '../../domain/errors/hero-inactive.error.js';
import { HeroNotFoundError } from '../../domain/errors/hero-not-found.error.js';
import { InvalidHeroError } from '../../domain/errors/invalid-hero.error.js';
import { UpdateHeroUseCase } from './update-hero.use-case.js';

describe('UpdateHeroUseCase', () => {
  let repository: InMemoryHeroRepository;
  let useCase: UpdateHeroUseCase;

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    useCase = new UpdateHeroUseCase(repository);
  });

  it('updates and persists the hero', async () => {
    const hero = makeHero();
    await repository.save(hero);

    const updated = await useCase.execute(hero.id, {
      nickname: 'The Hulk',
      mainPower: 'Gamma strength',
    });

    expect(updated).toMatchObject({
      nickname: 'The Hulk',
      mainPower: 'Gamma strength',
    });
    expect(await repository.findById(hero.id)).toMatchObject({
      nickname: 'The Hulk',
      mainPower: 'Gamma strength',
    });
  });

  it('fails when the hero does not exist', async () => {
    await expect(
      useCase.execute('missing-id', { nickname: 'Other' }),
    ).rejects.toThrow(HeroNotFoundError);
  });

  it('does not update an inactive hero', async () => {
    const hero = makeHero({}, { active: false });
    await repository.save(hero);

    await expect(
      useCase.execute(hero.id, { nickname: 'Other' }),
    ).rejects.toThrow(HeroInactiveError);
    expect((await repository.findById(hero.id))?.nickname).toBe('Hulk');
  });

  it('does not persist invalid changes', async () => {
    const hero = makeHero();
    await repository.save(hero);

    await expect(useCase.execute(hero.id, { name: '' })).rejects.toThrow(
      InvalidHeroError,
    );
    expect((await repository.findById(hero.id))?.name).toBe(
      'Robert Bruce Banner',
    );
  });
});
