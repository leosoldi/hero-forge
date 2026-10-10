import { DomainError } from '../../../../shared/domain/domain-error.js';

export class HeroInactiveError extends DomainError {
  readonly code = 'HERO_INACTIVE';

  constructor(heroId: string) {
    super(`Hero ${heroId} is inactive and cannot be updated`);
  }
}
