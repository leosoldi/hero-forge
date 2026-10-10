import { http, HttpResponse } from 'msw';
import { server } from '../../../test/msw-server';
import { ApiError } from './api-error';
import { httpClient } from './http-client';

describe('httpClient', () => {
  it('prefixes requests with /api and parses the JSON response', async () => {
    server.use(
      http.get('/api/heroes/42', () => HttpResponse.json({ id: '42' })),
    );

    await expect(httpClient.get('/heroes/42')).resolves.toEqual({ id: '42' });
  });

  it('sends query params, skipping empty values', async () => {
    let receivedUrl = '';
    server.use(
      http.get('/api/heroes', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    await httpClient.get('/heroes', {
      query: { page: 2, limit: 10, search: '', extra: undefined },
    });

    const { searchParams } = new URL(receivedUrl);
    expect(Object.fromEntries(searchParams)).toEqual({
      page: '2',
      limit: '10',
    });
  });

  it('sends the body as JSON', async () => {
    let receivedBody: unknown;
    server.use(
      http.post('/api/heroes', async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ id: '1' }, { status: 201 });
      }),
    );

    await httpClient.post('/heroes', { nickname: 'Hulk' });

    expect(receivedBody).toEqual({ nickname: 'Hulk' });
  });

  it('sends FormData as multipart, without forcing a JSON content type', async () => {
    let contentType: string | null = null;
    let hasFile = false;
    server.use(
      http.post('/api/uploads/images', async ({ request }) => {
        contentType = request.headers.get('content-type');
        hasFile = (await request.formData()).has('file');
        return HttpResponse.json({ url: 'http://x/a.png' }, { status: 201 });
      }),
    );
    const body = new FormData();
    body.append('file', new File(['img'], 'avatar.png', { type: 'image/png' }));

    await httpClient.post('/uploads/images', body);

    expect(contentType).toMatch(/^multipart\/form-data/);
    expect(hasFile).toBe(true);
  });

  it('turns API errors into ApiError with code and details', async () => {
    server.use(
      http.post('/api/heroes', () =>
        HttpResponse.json(
          {
            status_code: 400,
            code: 'VALIDATION_ERROR',
            message: 'invalid',
            details: [
              { field: 'name', messages: ['name should not be empty'] },
            ],
          },
          { status: 400 },
        ),
      ),
    );

    const error = await httpClient.post('/heroes', {}).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      details: [{ field: 'name', messages: ['name should not be empty'] }],
    });
  });

  it('handles error responses without a JSON body', async () => {
    server.use(
      http.get(
        '/api/heroes',
        () => new HttpResponse('Bad gateway', { status: 502 }),
      ),
    );

    await expect(httpClient.get('/heroes')).rejects.toMatchObject({
      status: 502,
      code: 'HTTP_ERROR',
    });
  });

  it('reports network failures as NETWORK_ERROR', async () => {
    server.use(http.get('/api/heroes', () => HttpResponse.error()));

    await expect(httpClient.get('/heroes')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });
});
