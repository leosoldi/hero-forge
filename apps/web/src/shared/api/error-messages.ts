import { ApiError } from './api-error';

export type ErrorMessages = Record<string, string>;

const DEFAULT_MESSAGES: ErrorMessages = {
  NETWORK_ERROR:
    'Não foi possível conectar à API. Verifique se ela está em execução.',
  VALIDATION_ERROR: 'Alguns campos estão inválidos. Revise e tente novamente.',
  INTERNAL_ERROR: 'Erro inesperado no servidor. Tente novamente em instantes.',
  INVALID_IMAGE: 'O arquivo precisa ser uma imagem JPEG, PNG ou WebP.',
  PAYLOAD_TOO_LARGE: 'A imagem deve ter no máximo 2 MB.',
  FILE_REQUIRED: 'Selecione uma imagem para enviar.',
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
