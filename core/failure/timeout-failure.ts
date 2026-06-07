import { Failure } from './failure';

/**
 * Failure produced when a request was sent but the server did not respond
 * within the allotted time budget (axios `ECONNABORTED` / `ETIMEDOUT`, or an
 * XHR upload `ontimeout`). Distinct from `NetworkFailure`: the connection was
 * reachable, it just took too long.
 */
export class TimeoutFailure extends Failure {
  readonly code = 'timeout';
  constructor(readonly message: string = 'Request timed out') {
    super();
  }
}
