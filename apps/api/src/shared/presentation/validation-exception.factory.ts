import { BadRequestException, type ValidationError } from '@nestjs/common';
import type { ErrorDetail, ErrorResponse } from './error-response.js';

export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const body: ErrorResponse = {
    status_code: 400,
    code: 'VALIDATION_ERROR',
    message: 'The request contains invalid fields',
    details: flatten(errors),
  };

  return new BadRequestException(body);
}

function flatten(errors: ValidationError[], parent = ''): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];

    return [...own, ...flatten(error.children ?? [], field)];
  });
}
