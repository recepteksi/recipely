import { Failure } from './failure';

export class ValidationFailure extends Failure {
  readonly code = 'validation';
  constructor(
    readonly message: string,
    readonly field?: string,
  ) {
    super();
  }
}
