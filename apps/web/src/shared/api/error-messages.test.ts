import { ApiError } from './api-error';
import { getErrorMessage } from './error-messages';

const apiError = (code: string) =>
  new ApiError({ status: 400, code, message: 'original message' });

describe('getErrorMessage', () => {
  it('uses the feature-specific message first', () => {
    expect(
      getErrorMessage(apiError('HERO_INACTIVE'), {
        HERO_INACTIVE: 'Heróis inativos não podem ser editados.',
      }),
    ).toBe('Heróis inativos não podem ser editados.');
  });

  it('falls back to the default messages', () => {
    expect(getErrorMessage(apiError('NETWORK_ERROR'))).toMatch(
      /Não foi possível conectar à API/,
    );
  });

  it('uses the fallback for unknown codes and non-API errors', () => {
    expect(getErrorMessage(apiError('SOMETHING_NEW'), {}, 'Falhou')).toBe(
      'Falhou',
    );
    expect(getErrorMessage(new Error('boom'))).toBe(
      'Algo deu errado. Tente novamente.',
    );
  });
});
