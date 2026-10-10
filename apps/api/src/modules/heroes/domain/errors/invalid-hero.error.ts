import { DomainError } from '../../../../shared/domain/domain-error.js';

export class InvalidHeroError extends DomainError {
  readonly code = 'INVALID_HERO';

  constructor(readonly details: string[]) {
    super(`Invalid hero data: ${details.join('; ')}`);
  }
}
