import request from 'supertest';
import { createTestApp, type TestApp } from '../support/create-test-app.js';

describe('Hero suggestions (e2e, demo provider)', () => {
  let testApp: TestApp;
  const http = () => request(testApp.app.getHttpServer());

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  it('suggests a hero ready to be sent to POST /heroes', async () => {
    const response = await http()
      .post('/hero-suggestions')
      .send({ idea: 'heroína do sertão que controla raios' })
      .expect(200);

    expect(response.body).toEqual({
      name: expect.any(String),
      nickname: expect.any(String),
      date_of_birth: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 00:00:00$/),
      universe: expect.any(String),
      main_power: expect.any(String),
      backstory: expect.any(String),
      avatar_url: expect.stringMatching(/\/uploads\/.+\.png$/),
    });

    const { backstory: _backstory, ...hero } = response.body;
    await http()
      .post('/heroes')
      .send({ ...hero, date_of_birth: hero.date_of_birth.slice(0, 10) })
      .expect(201);

    await http().get(new URL(hero.avatar_url).pathname).expect(200);
  });

  it('informs the provider in use and its daily limit', async () => {
    await http()
      .get('/hero-suggestions/info')
      .expect(200)
      .expect({ provider: 'demo', daily_limit: null, resets_at_utc: null });
  });

  it('validates the idea length', async () => {
    await http()
      .post('/hero-suggestions')
      .send({ idea: 'x'.repeat(201) })
      .expect(400);
  });
});
