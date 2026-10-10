import {
  DomainError,
  DomainErrorType,
} from '../../../shared/domain/domain-error.js';

export class AiUnavailableError extends DomainError {
  readonly code = 'AI_UNAVAILABLE';
  readonly type = DomainErrorType.Unavailable;

  constructor(reason: string) {
    super(`The AI provider could not generate a suggestion: ${reason}`);
  }
}
