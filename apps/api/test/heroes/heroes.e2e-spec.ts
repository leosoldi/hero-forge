import request from 'supertest';
import { HeroMapper } from '../../src/modules/heroes/infrastructure/persistence/hero.mapper.js';
import { HeroOrmEntity } from '../../src/modules/heroes/infrastructure/persistence/hero.orm-entity.js';
import { createTestApp, type TestApp } from '../support/create-test-app.js';
import { makeHero } from '../support/hero.factory.js';

const DATE_TIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

const hulk = {
  name: 'Robert Bruce Banner',
  nickname: 'Hulk',
  date_of_birth: '1962-04-10',
  universe: 'Marvel',
  main_power: 'Force',
  avatar_url:
    'https://cdn.pixabay.com/photo/2024/05/07/00/59/hulk-8744607_1280.jpg',
};

describe('Heroes (e2e)', () => {
  let testApp: TestApp;

  const http = () => request(testApp.app.getHttpServer());

  const createHero = async (overrides: Partial<typeof hulk> = {}) => {
    const response = await http()
      .post('/heroes')
      .send({ ...hulk, ...overrides })
      .expect(201);
    return response.body as { id: string } & Record<string, unknown>;
  };

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  beforeEach(async () => {
    await testApp.dataSource.getRepository(HeroOrmEntity).clear();
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  describe('POST /heroes', () => {
    it('creates a hero and answers in the contract format', async () => {
      const response = await http().post('/heroes').send(hulk).expect(201);

      expect(response.body).toEqual({
        id: expect.stringMatching(UUID_V4),
        name: 'Robert Bruce Banner',
        nickname: 'Hulk',
        date_of_birth: '1962-04-10 00:00:00',
        universe: 'Marvel',
        main_power: 'Force',
        avatar_url: hulk.avatar_url,
        is_active: true,
        created_at: expect.stringMatching(DATE_TIME),
        updated_at: expect.stringMatching(DATE_TIME),
      });
    });

    it('accepts the date of birth in the same format the API returns', async () => {
      const hero = await createHero({ date_of_birth: '1962-04-10 00:00:00' });

      expect(hero.date_of_birth).toBe('1962-04-10 00:00:00');
    });

    it('rejects invalid fields with the list of problems', async () => {
      const response = await http()
        .post('/heroes')
        .send({
          ...hulk,
          name: '',
          date_of_birth: '2026-02-31',
          avatar_url: 'not-a-url',
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(
        response.body.details.map((detail: { field: string }) => detail.field),
      ).toEqual(['name', 'date_of_birth', 'avatar_url']);
    });

    it('rejects fields that cannot be set by the client', async () => {
      const response = await http()
        .post('/heroes')
        .send({ ...hulk, is_active: false, id: MISSING_ID })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          {
            field: 'is_active',
            messages: ['property is_active should not exist'],
          },
          { field: 'id', messages: ['property id should not exist'] },
        ]),
      );
    });

    it('rejects a date of birth in the future (business rule)', async () => {
      const response = await http()
        .post('/heroes')
        .send({ ...hulk, date_of_birth: '2999-01-01' })
        .expect(422);

      expect(response.body.code).toBe('INVALID_HERO');
    });
  });

  describe('GET /heroes', () => {
    it('lists the most recent heroes first, 10 per page', async () => {
      const repository = testApp.dataSource.getRepository(HeroOrmEntity);
      for (let i = 0; i < 12; i++) {
        const hero = makeHero(
          { nickname: `Hero ${String(i).padStart(2, '0')}` },
          { now: new Date(Date.UTC(2026, 0, 1, 0, 0, i)) },
        );
        await repository.save(HeroMapper.toPersistence(hero));
      }

      const firstPage = await http().get('/heroes').expect(200);
      const secondPage = await http().get('/heroes?page=2').expect(200);

      expect(firstPage.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 12,
        total_pages: 2,
      });
      expect(firstPage.body.data).toHaveLength(10);
      expect(firstPage.body.data[0].nickname).toBe('Hero 11');
      expect(
        secondPage.body.data.map((hero: { nickname: string }) => hero.nickname),
      ).toEqual(['Hero 01', 'Hero 00']);
    });

    it('searches by name or nickname', async () => {
      await createHero({ name: 'Bruce Wayne', nickname: 'Batman' });
      await createHero({ name: 'Diana Prince', nickname: 'Wonder Woman' });

      const byNickname = await http().get('/heroes?search=bat').expect(200);
      const byName = await http().get('/heroes?search=Prince').expect(200);

      expect(
        byNickname.body.data.map((hero: { nickname: string }) => hero.nickname),
      ).toEqual(['Batman']);
      expect(
        byName.body.data.map((hero: { nickname: string }) => hero.nickname),
      ).toEqual(['Wonder Woman']);
    });

    it('rejects invalid pagination parameters', async () => {
      const response = await http().get('/heroes?page=0&limit=500').expect(400);

      expect(
        response.body.details.map((detail: { field: string }) => detail.field),
      ).toEqual(['page', 'limit']);
    });
  });

  describe('GET /heroes/:id', () => {
    it('returns the hero', async () => {
      const hero = await createHero();

      const response = await http().get(`/heroes/${hero.id}`).expect(200);

      expect(response.body).toEqual(hero);
    });

    it('returns 404 when the hero does not exist', async () => {
      const response = await http().get(`/heroes/${MISSING_ID}`).expect(404);

      expect(response.body.code).toBe('HERO_NOT_FOUND');
    });

    it('returns 400 when the id is not a UUID', async () => {
      await http().get('/heroes/123').expect(400);
    });
  });

  describe('PUT /heroes/:id', () => {
    const changes = {
      ...hulk,
      nickname: 'The Incredible Hulk',
      main_power: 'Gamma strength',
    };

    it('updates the editable fields', async () => {
      const hero = await createHero();

      const response = await http()
        .put(`/heroes/${hero.id}`)
        .send(changes)
        .expect(200);

      expect(response.body).toMatchObject({
        id: hero.id,
        nickname: 'The Incredible Hulk',
        main_power: 'Gamma strength',
        created_at: hero.created_at,
      });
    });

    it('does not allow changing non-editable fields', async () => {
      const hero = await createHero();

      await http()
        .put(`/heroes/${hero.id}`)
        .send({
          ...changes,
          is_active: false,
          created_at: '2000-01-01 00:00:00',
        })
        .expect(400);
    });

    it('returns 409 when the hero is inactive', async () => {
      const hero = await createHero();
      await http().delete(`/heroes/${hero.id}`).expect(200);

      const response = await http()
        .put(`/heroes/${hero.id}`)
        .send(changes)
        .expect(409);

      expect(response.body.code).toBe('HERO_INACTIVE');
    });

    it('returns 404 when the hero does not exist', async () => {
      await http().put(`/heroes/${MISSING_ID}`).send(changes).expect(404);
    });
  });

  describe('DELETE /heroes/:id', () => {
    it('deactivates the hero, keeping it in the listing', async () => {
      const hero = await createHero();

      const response = await http().delete(`/heroes/${hero.id}`).expect(200);
      const list = await http().get('/heroes').expect(200);

      expect(response.body.is_active).toBe(false);
      expect(list.body.data).toEqual([
        expect.objectContaining({ id: hero.id, is_active: false }),
      ]);
    });

    it('returns 409 when the hero is already inactive', async () => {
      const hero = await createHero();
      await http().delete(`/heroes/${hero.id}`).expect(200);

      const response = await http().delete(`/heroes/${hero.id}`).expect(409);

      expect(response.body.code).toBe('HERO_ALREADY_INACTIVE');
    });

    it('returns 404 when the hero does not exist', async () => {
      await http().delete(`/heroes/${MISSING_ID}`).expect(404);
    });
  });

  describe('PATCH /heroes/:id/activate', () => {
    it('reactivates an inactive hero', async () => {
      const hero = await createHero();
      await http().delete(`/heroes/${hero.id}`).expect(200);

      const response = await http()
        .patch(`/heroes/${hero.id}/activate`)
        .expect(200);

      expect(response.body.is_active).toBe(true);
    });

    it('returns 409 when the hero is already active', async () => {
      const hero = await createHero();

      const response = await http()
        .patch(`/heroes/${hero.id}/activate`)
        .expect(409);

      expect(response.body.code).toBe('HERO_ALREADY_ACTIVE');
    });

    it('returns 404 when the hero does not exist', async () => {
      await http().patch(`/heroes/${MISSING_ID}/activate`).expect(404);
    });
  });
});
