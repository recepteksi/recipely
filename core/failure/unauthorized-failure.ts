import { Failure } from './failure';

/**
 * Failure produced when the caller lacks valid credentials or the server
 * returns a 401 / 403 response.
 */
export class UnauthorizedFailure extends Failure {
  readonly code = 'unauthorized';
  constructor(readonly message: string = 'Unauthorized') {
    super();
  }
}
