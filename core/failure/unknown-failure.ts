import { Failure } from './failure';

export class UnknownFailure extends Failure {
  readonly code = 'unknown';
  constructor(
    readonly message: string = 'Unknown error',
    readonly cause?: unknown,
  ) {
    super();
  }
}
