import {
  DomainError,
  DomainErrorType,
} from '../../../../shared/domain/domain-error.js';

export class HeroNotFoundError extends DomainError {
  readonly code = 'HERO_NOT_FOUND';
  readonly type = DomainErrorType.NotFound;

  constructor(heroId: string) {
    super(`Hero ${heroId} not found`);
  }
}
