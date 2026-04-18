import { Failure } from './failure';

export class UnauthorizedFailure extends Failure {
  readonly code = 'unauthorized';
  constructor(readonly message: string = 'Unauthorized') {
    super();
  }
}
