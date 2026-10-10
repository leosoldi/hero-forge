import { ApiError } from './api-error';

export type ErrorMessages = Record<string, string>;

const DEFAULT_MESSAGES: ErrorMessages = {
  NETWORK_ERROR:
    'Não foi possível conectar à API. Verifique se ela está em execução.',
  VALIDATION_ERROR: 'Alguns campos estão inválidos. Revise e tente novamente.',
  INTERNAL_ERROR: 'Erro inesperado no servidor. Tente novamente em instantes.',
};

export function getErrorMessage(
  error: unknown,
  messages: ErrorMessages = {},
  fallback = 'Algo deu errado. Tente novamente.',
): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? DEFAULT_MESSAGES[error.code] ?? fallback;
  }

  return fallback;
}
