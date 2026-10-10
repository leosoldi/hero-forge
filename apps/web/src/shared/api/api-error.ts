export interface ApiErrorDetail {
  field: string;
  messages: string[];
}

interface ApiErrorParams {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor({ status, code, message, details = [] }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromResponse(status: number, payload: unknown): ApiError {
    if (isErrorPayload(payload)) {
      return new ApiError({
        status,
        code: payload.code,
        message: payload.message,
        details: payload.details,
      });
    }

    return new ApiError({
      status,
      code: 'HTTP_ERROR',
      message: `Request failed with status ${status}`,
    });
  }
}

function isErrorPayload(
  payload: unknown,
): payload is { code: string; message: string; details?: ApiErrorDetail[] } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as { code?: unknown }).code === 'string' &&
    typeof (payload as { message?: unknown }).message === 'string'
  );
}
