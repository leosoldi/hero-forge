import type { ErrorMessages } from '../../../shared/api/error-messages';

export const HERO_ERROR_MESSAGES: ErrorMessages = {
  HERO_NOT_FOUND: 'Herói não encontrado. Ele pode ter sido removido.',
  HERO_INACTIVE: 'Heróis inativos não podem ser editados.',
  HERO_ALREADY_ACTIVE: 'Este herói já está ativo.',
  HERO_ALREADY_INACTIVE: 'Este herói já está inativo.',
  INVALID_HERO: 'Os dados do herói não são válidos.',
  AI_UNAVAILABLE:
    'A IA não conseguiu gerar uma sugestão agora. Tente novamente em instantes.',
};
