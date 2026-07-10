import { Failure } from '@core/failure/failure';

/**
 * Failure produced when the caller has sent too many requests in a window and
 * the server is throttling them (HTTP 429). `retryAfterSeconds`, when the
 * server provides it, tells the UI how long to wait before offering a retry.
 */
export class RateLimitFailure extends Failure {
  readonly code = 'rate_limit';
  constructor(
    readonly message: string = 'Too many requests',
    readonly retryAfterSeconds?: number,
  ) {
    super();
  }
}
