import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/domain-error.js';

export class HeroInactiveError extends DomainError {
  readonly code = 'HERO_INACTIVE';
  readonly type = DomainErrorType.Conflict;

  constructor(heroId: string) {
    super(`Hero ${heroId} is inactive and cannot be updated`);
  }
}
