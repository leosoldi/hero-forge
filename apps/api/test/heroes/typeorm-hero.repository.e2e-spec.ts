import { DataSource, type Repository } from 'typeorm';
import { validateEnv } from '../../src/config/env.validation.js';
import { buildDataSourceOptions } from '../../src/database/database.options.js';
import { HeroOrmEntity } from '../../src/modules/heroes/infrastructure/persistence/hero.orm-entity.js';
import { TypeOrmHeroRepository } from '../../src/modules/heroes/infrastructure/persistence/typeorm-hero.repository.js';
import { makeHero } from '../support/hero.factory.js';

describe('TypeOrmHeroRepository (integration)', () => {
  let dataSource: DataSource;
  let ormRepository: Repository<HeroOrmEntity>;
  let repository: TypeOrmHeroRepository;

  const at = (second: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, second));

  beforeAll(async () => {
    dataSource = new DataSource(
      buildDataSourceOptions(validateEnv(process.env)),
    );
    await dataSource.initialize();
    await dataSource.runMigrations();

    ormRepository = dataSource.getRepository(HeroOrmEntity);
    repository = new TypeOrmHeroRepository(ormRepository);
  });

  beforeEach(async () => {
    await ormRepository.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('save and findById', () => {
    it('persists every field without changes', async () => {
      const hero = makeHero({}, { now: new Date('2026-10-09T21:41:43.123Z') });

      await repository.save(hero);
      const found = await repository.findById(hero.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(hero.id);
      expect(found?.name).toBe('Robert Bruce Banner');
      expect(found?.nickname).toBe('Hulk');
      expect(found?.universe).toBe('Marvel');
      expect(found?.mainPower).toBe('Force');
      expect(found?.avatarUrl).toBe('https://example.com/hulk.jpg');
      expect(found?.isActive).toBe(true);
      expect(found?.createdAt.toISOString()).toBe('2026-10-09T21:41:43.123Z');
    });

    it('keeps the date of birth regardless of the server time zone', async () => {
      const hero = makeHero({
        dateOfBirth: new Date('1962-04-10T00:00:00.000Z'),
      });

      await repository.save(hero);
      const found = await repository.findById(hero.id);

      expect(found?.dateOfBirth.toISOString()).toBe('1962-04-10T00:00:00.000Z');
    });

    it('returns null when the hero does not exist', async () => {
      await expect(
        repository.findById('00000000-0000-4000-8000-000000000000'),
      ).resolves.toBeNull();
    });

    it('updates an existing hero instead of duplicating it', async () => {
      const hero = makeHero();
      await repository.save(hero);

      hero.update({ nickname: 'The Hulk' });
      hero.deactivate();
      await repository.save(hero);

      expect(await ormRepository.count()).toBe(1);
      expect(await repository.findById(hero.id)).toMatchObject({
        nickname: 'The Hulk',
        isActive: false,
      });
    });
  });

  describe('findMany', () => {
    it('returns the most recent heroes first, paginated', async () => {
      for (let i = 0; i < 12; i++) {
        await repository.save(
          makeHero({ nickname: `Hero ${i}` }, { now: at(i) }),
        );
      }

      const firstPage = await repository.findMany({ page: 1, limit: 10 });
      const secondPage = await repository.findMany({ page: 2, limit: 10 });

      expect(firstPage.total).toBe(12);
      expect(firstPage.items).toHaveLength(10);
      expect(firstPage.items[0].nickname).toBe('Hero 11');
      expect(secondPage.items.map((hero) => hero.nickname)).toEqual([
        'Hero 1',
        'Hero 0',
      ]);
    });

    it('orders heroes created at the same time consistently', async () => {
      const ids = [
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000003',
      ];
      for (const id of ids) {
        await repository.save(makeHero({}, { id, now: at(0) }));
      }

      const { items } = await repository.findMany({ page: 1, limit: 10 });

      expect(items.map((hero) => hero.id)).toEqual([...ids].reverse());
    });

    it('searches by name or nickname, ignoring case', async () => {
      await repository.save(
        makeHero({ name: 'Bruce Wayne', nickname: 'Batman' }, { now: at(1) }),
      );
      await repository.save(
        makeHero(
          { name: 'Diana Prince', nickname: 'Wonder Woman' },
          { now: at(2) },
        ),
      );
      await repository.save(
        makeHero({ name: 'Clark Kent', nickname: 'Superman' }, { now: at(3) }),
      );

      const byNickname = await repository.findMany({
        page: 1,
        limit: 10,
        search: 'BAT',
      });
      const byName = await repository.findMany({
        page: 1,
        limit: 10,
        search: 'prince',
      });

      expect(byNickname.items.map((hero) => hero.nickname)).toEqual(['Batman']);
      expect(byName.items.map((hero) => hero.nickname)).toEqual([
        'Wonder Woman',
      ]);
      expect(byName.total).toBe(1);
    });

    it('treats LIKE wildcards in the search as plain text', async () => {
      await repository.save(
        makeHero({ nickname: '100% Hero' }, { now: at(1) }),
      );
      await repository.save(makeHero({ nickname: 'Other' }, { now: at(2) }));

      const percent = await repository.findMany({
        page: 1,
        limit: 10,
        search: '%',
      });
      const underscore = await repository.findMany({
        page: 1,
        limit: 10,
        search: '_',
      });

      expect(percent.items.map((hero) => hero.nickname)).toEqual(['100% Hero']);
      expect(underscore.total).toBe(0);
    });

    it('includes inactive heroes in the listing', async () => {
      await repository.save(makeHero({}, { active: false }));

      const { items } = await repository.findMany({ page: 1, limit: 10 });

      expect(items).toHaveLength(1);
      expect(items[0].isActive).toBe(false);
    });
  });
});
