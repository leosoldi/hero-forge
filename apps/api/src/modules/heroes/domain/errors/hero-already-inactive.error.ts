import { DomainError } from '../../../../shared/domain/domain-error.js';

export class HeroAlreadyInactiveError extends DomainError {
  readonly code = 'HERO_ALREADY_INACTIVE';

  constructor(heroId: string) {
    super(`Hero ${heroId} is already inactive`);
  }
}
