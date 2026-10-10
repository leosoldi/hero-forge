import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, DomainErrorType } from '../../domain/domain-error.js';
import type { ErrorResponse } from '../error-response.js';

const STATUS_BY_DOMAIN_ERROR: Record<DomainErrorType, HttpStatus> = {
  [DomainErrorType.NotFound]: HttpStatus.NOT_FOUND,
  [DomainErrorType.Conflict]: HttpStatus.CONFLICT,
  [DomainErrorType.Validation]: HttpStatus.UNPROCESSABLE_ENTITY,
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toErrorResponse(exception);

    response.status(body.status_code).json(body);
  }

  private toErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof DomainError) {
      return {
        status_code: STATUS_BY_DOMAIN_ERROR[exception.type],
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );

    return {
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private fromHttpException(exception: HttpException): ErrorResponse {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (isErrorResponse(payload)) {
      return payload;
    }

    const message =
      typeof payload === 'object' && 'message' in payload
        ? [payload.message].flat().join('; ')
        : exception.message;

    return {
      status_code: status,
      code: HttpStatus[status] ?? 'HTTP_ERROR',
      message,
    };
  }
}

function isErrorResponse(payload: unknown): payload is ErrorResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'status_code' in payload &&
    'code' in payload
  );
}
