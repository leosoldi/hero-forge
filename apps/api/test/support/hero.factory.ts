import { Hero, type HeroData } from '../../src/modules/heroes/domain/hero.js';

export const heroData = (overrides: Partial<HeroData> = {}): HeroData => ({
  name: 'Robert Bruce Banner',
  nickname: 'Hulk',
  dateOfBirth: new Date('1962-04-10T00:00:00.000Z'),
  universe: 'Marvel',
  mainPower: 'Force',
  avatarUrl: 'https://example.com/hulk.jpg',
  ...overrides,
});

export const makeHero = (
  overrides: Partial<HeroData> = {},
  options: { id?: string; now?: Date; active?: boolean } = {},
): Hero => {
  const hero = Hero.create(heroData(overrides), {
    id: options.id,
    now: options.now,
  });

  if (options.active === false) {
    hero.deactivate(options.now);
  }

  return hero;
};
