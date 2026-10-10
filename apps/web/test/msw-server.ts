import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const defaultHandlers = [
  http.get('/api/hero-suggestions/info', () =>
    HttpResponse.json({
      provider: 'demo',
      daily_limit: null,
      resets_at_utc: null,
    }),
  ),
];

export const server = setupServer(...defaultHandlers);
