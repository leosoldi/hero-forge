import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/domain-error.js';

export class HeroAlreadyActiveError extends DomainError {
  readonly code = 'HERO_ALREADY_ACTIVE';
  readonly type = DomainErrorType.Conflict;

  constructor(heroId: string) {
    super(`Hero ${heroId} is already active`);
  }
}
