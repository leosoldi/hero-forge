import {
  type ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HeroAlreadyActiveError } from '../../../modules/heroes/domain/errors/hero-already-active.error.js';
import { HeroNotFoundError } from '../../../modules/heroes/domain/errors/hero-not-found.error.js';
import { InvalidHeroError } from '../../../modules/heroes/domain/errors/invalid-hero.error.js';
import { GlobalExceptionFilter } from './global-exception.filter.js';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    json.mockClear();
    status.mockClear();
  });

  const handle = (exception: unknown) => {
    filter.catch(exception, host);
    return { status: status.mock.calls[0][0], body: json.mock.calls[0][0] };
  };

  it.each([
    [new HeroNotFoundError('42'), 404, 'HERO_NOT_FOUND'],
    [new HeroAlreadyActiveError('42'), 409, 'HERO_ALREADY_ACTIVE'],
    [new InvalidHeroError(['name is required']), 422, 'INVALID_HERO'],
  ])('maps %s to HTTP %i', (error, expectedStatus, expectedCode) => {
    const { status: sent, body } = handle(error);

    expect(sent).toBe(expectedStatus);
    expect(body).toEqual({
      status_code: expectedStatus,
      code: expectedCode,
      message: error.message,
    });
  });

  it('keeps bodies that already follow the error format', () => {
    const payload = {
      status_code: 400,
      code: 'VALIDATION_ERROR',
      message: 'invalid',
      details: [{ field: 'name', messages: ['name should not be empty'] }],
    };

    expect(handle(new BadRequestException(payload)).body).toEqual(payload);
  });

  it('normalizes framework HTTP exceptions', () => {
    const { status: sent, body } = handle(
      new NotFoundException('Cannot GET /nope'),
    );

    expect(sent).toBe(404);
    expect(body).toEqual({
      status_code: 404,
      code: 'NOT_FOUND',
      message: 'Cannot GET /nope',
    });
  });

  it('hides unexpected errors behind a generic 500 and logs them', () => {
    const log = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    const { status: sent, body } = handle(new Error('connection lost'));

    expect(sent).toBe(500);
    expect(body).toEqual({
      status_code: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
    expect(log).toHaveBeenCalledWith('connection lost', expect.any(String));
  });
});
