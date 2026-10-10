import { rm } from 'node:fs/promises';
import request from 'supertest';
import { createTestApp, type TestApp } from '../support/create-test-app.js';
import { PNG_BYTES } from '../support/images.js';

describe('Uploads (e2e)', () => {
  let testApp: TestApp;
  const http = () => request(testApp.app.getHttpServer());

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(async () => {
    await testApp.app.close();
    await rm(process.env.UPLOADS_DIR!, { recursive: true, force: true });
  });

  it('stores an image and serves it at the returned URL', async () => {
    const response = await http()
      .post('/uploads/images')
      .attach('file', PNG_BYTES, 'avatar.png')
      .expect(201);

    const { pathname } = new URL(response.body.url);
    expect(pathname).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);

    const file = await http().get(pathname).expect(200);
    expect(file.headers['content-type']).toBe('image/png');
    expect(file.headers['x-content-type-options']).toBe('nosniff');
  });

  it('uses the real content, not the file name, to validate the image', async () => {
    const response = await http()
      .post('/uploads/images')
      .attach('file', Buffer.from('<script>alert(1)</script>'), 'avatar.png')
      .expect(422);

    expect(response.body.code).toBe('INVALID_IMAGE');
  });

  it('requires a file', async () => {
    const response = await http().post('/uploads/images').expect(400);

    expect(response.body.code).toBe('FILE_REQUIRED');
  });

  it('rejects files larger than 2 MB', async () => {
    const tooBig = Buffer.concat([PNG_BYTES, Buffer.alloc(2 * 1024 * 1024)]);

    const response = await http()
      .post('/uploads/images')
      .attach('file', tooBig, 'big.png')
      .expect(413);

    expect(response.body.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
