import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/domain-error.js';

export class HeroAlreadyInactiveError extends DomainError {
  readonly code = 'HERO_ALREADY_INACTIVE';
  readonly type = DomainErrorType.Conflict;

  constructor(heroId: string) {
    super(`Hero ${heroId} is already inactive`);
  }
}
