import {
  type Failure,
  ConflictFailure,
  ForbiddenFailure,
  NotFoundFailure,
  RateLimitFailure,
  ServerFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';

/**
 * The Recipely backend wraps every error as `{ error: { code, message, field? } }`
 * inside the AES envelope. The HTTP client decrypts the envelope, then hands the
 * decrypted body here.
 */
interface RecipelyErrorBody {
  error?: {
    code?: string;
    message?: string;
    field?: string;
  };
}

const isRecipelyErrorBody = (body: unknown): body is RecipelyErrorBody =>
  typeof body === 'object' && body !== null && 'error' in body;

/**
 * Maps a non-2xx HTTP response to the domain `Failure` hierarchy. The backend's
 * machine-readable `error.code` takes precedence so controller/store code never
 * branches on HTTP quirks; the numeric status is the fallback for responses that
 * lack a structured envelope. Every branch returns a concrete subtype — there is
 * no path that drops the error on the floor.
 */
export const failureFromResponse = (status: number, body: unknown): Failure => {
  const envelope = isRecipelyErrorBody(body) ? body.error : undefined;
  const message = envelope?.message ?? `HTTP ${status}`;

  if (envelope?.code) {
    switch (envelope.code) {
      case 'validation':
        return new ValidationFailure(message, envelope.field);
      case 'unprocessable':
        // 422: the request arrived but a required piece (e.g. a missing image or
        // field) was absent. Surface as ValidationFailure so the UI reads it as
        // "fix your input"; `field` tells the UI which input was missing.
        return new ValidationFailure(message, envelope.field);
      case 'unauthorized':
        return new UnauthorizedFailure(message);
      case 'forbidden':
        return new ForbiddenFailure(message);
      case 'not_found':
        return new NotFoundFailure(message);
      case 'conflict':
        return new ConflictFailure(message, envelope.field);
      case 'rate_limit':
      case 'too_many_requests':
        return new RateLimitFailure(message);
      case 'server':
      case 'internal':
        return new ServerFailure(message, status);
    }
  }

  if (status === 401) return new UnauthorizedFailure(message);
  if (status === 403) return new ForbiddenFailure(message);
  if (status === 404) return new NotFoundFailure(message);
  if (status === 409) return new ConflictFailure(message, envelope?.field);
  if (status === 429) return new RateLimitFailure(message);
  if (status >= 500) return new ServerFailure(message, status);
  if (status >= 400) return new ValidationFailure(message, envelope?.field);
  return new UnknownFailure(message);
};
