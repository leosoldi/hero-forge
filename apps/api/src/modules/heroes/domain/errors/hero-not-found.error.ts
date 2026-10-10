import { DomainError } from '../../../../shared/domain/domain-error.js';

export class HeroNotFoundError extends DomainError {
  readonly code = 'HERO_NOT_FOUND';

  constructor(heroId: string) {
    super(`Hero ${heroId} not found`);
  }
}
