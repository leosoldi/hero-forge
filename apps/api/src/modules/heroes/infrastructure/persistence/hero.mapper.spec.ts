import { Hero } from '../../domain/hero.js';
import { HeroMapper } from './hero.mapper.js';
import { HeroOrmEntity } from './hero.orm-entity.js';

const NOW = new Date('2026-10-09T12:00:00.123Z');

const buildEntity = (): HeroOrmEntity =>
  Object.assign(new HeroOrmEntity(), {
    id: 'e314636e-1ca6-4925-a0e7-da5eb5ae2403',
    name: 'Robert Bruce Banner',
    nickname: 'Hulk',
    dateOfBirth: '1962-04-10',
    universe: 'Marvel',
    mainPower: 'Force',
    avatarUrl: 'https://example.com/hulk.jpg',
    isActive: false,
    createdAt: NOW,
    updatedAt: NOW,
  });

describe('HeroMapper', () => {
  it('maps a database row to a domain hero', () => {
    const hero = HeroMapper.toDomain(buildEntity());

    expect(hero).toBeInstanceOf(Hero);
    expect(hero.id).toBe('e314636e-1ca6-4925-a0e7-da5eb5ae2403');
    expect(hero.dateOfBirth.toISOString()).toBe('1962-04-10T00:00:00.000Z');
    expect(hero.isActive).toBe(false);
    expect(hero.createdAt).toEqual(NOW);
  });

  it('maps a domain hero to a database row', () => {
    const hero = Hero.create(
      {
        name: 'Diana Prince',
        nickname: 'Wonder Woman',
        dateOfBirth: new Date('1941-10-21T00:00:00.000Z'),
        universe: 'DC',
        mainPower: 'Super strength',
        avatarUrl: 'https://example.com/diana.jpg',
      },
      { now: NOW },
    );

    const entity = HeroMapper.toPersistence(hero);

    expect(entity).toBeInstanceOf(HeroOrmEntity);
    expect(entity).toMatchObject({
      id: hero.id,
      nickname: 'Wonder Woman',
      dateOfBirth: '1941-10-21',
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('keeps the data intact on a round trip', () => {
    const entity = buildEntity();

    expect(HeroMapper.toPersistence(HeroMapper.toDomain(entity))).toEqual(
      entity,
    );
  });
});
