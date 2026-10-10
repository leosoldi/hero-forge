import { Hero, type HeroData } from './hero.js';
import { HeroAlreadyActiveError } from './errors/hero-already-active.error.js';
import { HeroAlreadyInactiveError } from './errors/hero-already-inactive.error.js';
import { HeroInactiveError } from './errors/hero-inactive.error.js';
import { InvalidHeroError } from './errors/invalid-hero.error.js';

const NOW = new Date('2026-10-09T12:00:00.000Z');
const LATER = new Date('2026-10-10T08:30:00.000Z');

const validData = (): HeroData => ({
  name: 'Robert Bruce Banner',
  nickname: 'Hulk',
  dateOfBirth: new Date('1962-04-10T00:00:00.000Z'),
  universe: 'Marvel',
  mainPower: 'Force',
  avatarUrl: 'https://example.com/hulk.jpg',
});

const createHero = (data: Partial<HeroData> = {}) =>
  Hero.create({ ...validData(), ...data }, { now: NOW });

describe('Hero', () => {
  describe('create', () => {
    it('creates an active hero with a generated UUID and timestamps', () => {
      const hero = createHero();

      expect(hero.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(hero.isActive).toBe(true);
      expect(hero.createdAt).toEqual(NOW);
      expect(hero.updatedAt).toEqual(NOW);
    });

    it('uses the given id when provided', () => {
      const hero = Hero.create(validData(), { id: 'custom-id', now: NOW });

      expect(hero.id).toBe('custom-id');
    });

    it('trims text fields', () => {
      const hero = createHero({ name: '  Bruce Banner  ', nickname: ' Hulk ' });

      expect(hero.name).toBe('Bruce Banner');
      expect(hero.nickname).toBe('Hulk');
    });

    it('keeps only the date part of the date of birth (UTC)', () => {
      const hero = createHero({
        dateOfBirth: new Date('1962-04-10T18:45:00.000Z'),
      });

      expect(hero.dateOfBirth.toISOString()).toBe('1962-04-10T00:00:00.000Z');
    });

    it.each([
      'name',
      'nickname',
      'universe',
      'mainPower',
      'avatarUrl',
    ] as const)('rejects an empty %s', (field) => {
      expect(() => createHero({ [field]: '   ' })).toThrow(InvalidHeroError);
    });

    it('rejects text longer than the column limit', () => {
      expect(() => createHero({ nickname: 'x'.repeat(81) })).toThrow(
        /nickname must have at most 80 characters/,
      );
    });

    it.each(['not-a-url', 'ftp://example.com/hero.png', 'javascript:alert(1)'])(
      'rejects the avatar URL "%s"',
      (avatarUrl) => {
        expect(() => createHero({ avatarUrl })).toThrow(
          /avatarUrl must be a valid http\(s\) URL/,
        );
      },
    );

    it('rejects an invalid date of birth', () => {
      expect(() => createHero({ dateOfBirth: new Date('invalid') })).toThrow(
        /dateOfBirth must be a valid date/,
      );
    });

    it('rejects a date of birth in the future', () => {
      expect(() =>
        createHero({ dateOfBirth: new Date('2030-01-01T00:00:00.000Z') }),
      ).toThrow(/dateOfBirth cannot be in the future/);
    });

    it('reports every invalid field at once', () => {
      try {
        createHero({ name: '', nickname: '', avatarUrl: 'invalid' });
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidHeroError);
        expect((error as InvalidHeroError).details).toHaveLength(3);
      }
    });
  });

  describe('restore', () => {
    it('rebuilds a hero from persisted data without changing it', () => {
      const props = {
        ...validData(),
        id: 'e314636e-1ca6-4925-a0e7-da5eb5ae2403',
        isActive: false,
        createdAt: NOW,
        updatedAt: LATER,
      };

      const hero = Hero.restore(props);

      expect(hero.id).toBe(props.id);
      expect(hero.isActive).toBe(false);
      expect(hero.updatedAt).toEqual(LATER);
    });
  });

  describe('update', () => {
    it('updates the given fields and refreshes updatedAt', () => {
      const hero = createHero();

      hero.update({ nickname: 'The Hulk', universe: 'Marvel Comics' }, LATER);

      expect(hero.nickname).toBe('The Hulk');
      expect(hero.universe).toBe('Marvel Comics');
      expect(hero.name).toBe('Robert Bruce Banner');
      expect(hero.createdAt).toEqual(NOW);
      expect(hero.updatedAt).toEqual(LATER);
    });

    it('ignores fields explicitly set as undefined', () => {
      const hero = createHero();

      hero.update({ name: undefined, mainPower: 'Gamma strength' }, LATER);

      expect(hero.name).toBe('Robert Bruce Banner');
      expect(hero.mainPower).toBe('Gamma strength');
    });

    it('validates the new values', () => {
      const hero = createHero();

      expect(() => hero.update({ name: '' }, LATER)).toThrow(InvalidHeroError);
      expect(hero.name).toBe('Robert Bruce Banner');
    });

    it('does not allow updating an inactive hero', () => {
      const hero = createHero();
      hero.deactivate(LATER);

      expect(() => hero.update({ nickname: 'Other' })).toThrow(
        HeroInactiveError,
      );
    });
  });

  describe('deactivate', () => {
    it('marks the hero as inactive', () => {
      const hero = createHero();

      hero.deactivate(LATER);

      expect(hero.isActive).toBe(false);
      expect(hero.updatedAt).toEqual(LATER);
    });

    it('fails when the hero is already inactive', () => {
      const hero = createHero();
      hero.deactivate(LATER);

      expect(() => hero.deactivate()).toThrow(HeroAlreadyInactiveError);
    });
  });

  describe('activate', () => {
    it('marks an inactive hero as active again', () => {
      const hero = createHero();
      hero.deactivate(NOW);

      hero.activate(LATER);

      expect(hero.isActive).toBe(true);
      expect(hero.updatedAt).toEqual(LATER);
    });

    it('fails when the hero is already active', () => {
      const hero = createHero();

      expect(() => hero.activate()).toThrow(HeroAlreadyActiveError);
    });
  });
});
