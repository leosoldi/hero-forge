import {
  DomainError,
  DomainErrorType,
} from '../../../shared/domain/domain-error.js';

export class InvalidImageError extends DomainError {
  readonly code = 'INVALID_IMAGE';
  readonly type = DomainErrorType.Validation;

  constructor() {
    super('The file must be a JPEG, PNG or WebP image');
  }
}
