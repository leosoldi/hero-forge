import request from 'supertest';
import { createTestApp, type TestApp } from './support/create-test-app.js';

describe('Health (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  it('GET /health returns 200 when the database is reachable', () => {
    return request(testApp.app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('returns 404 in the standard error format for unknown routes', () => {
    return request(testApp.app.getHttpServer())
      .get('/unknown-route')
      .expect(404)
      .expect({
        status_code: 404,
        code: 'NOT_FOUND',
        message: 'Cannot GET /unknown-route',
      });
  });
});
