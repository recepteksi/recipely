import { Failure } from './failure';

/**
 * Failure produced when a network request cannot be completed due to
 * connectivity issues, timeouts, or DNS errors.
 */
export class NetworkFailure extends Failure {
  readonly code = 'network';
  constructor(readonly message: string = 'Network error') {
    super();
  }
}
