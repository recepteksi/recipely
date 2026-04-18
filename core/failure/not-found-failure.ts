import { Failure } from './failure';

export class NotFoundFailure extends Failure {
  readonly code = 'not_found';
  constructor(readonly message: string = 'Not found') {
    super();
  }
}
