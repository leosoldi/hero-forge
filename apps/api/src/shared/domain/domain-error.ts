export enum DomainErrorType {
  NotFound = 'NOT_FOUND',
  Conflict = 'CONFLICT',
  Validation = 'VALIDATION',
  Unavailable = 'UNAVAILABLE',
}

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly type: DomainErrorType;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
