import { Failure } from './failure';

export class NetworkFailure extends Failure {
  readonly code = 'network';
  constructor(readonly message: string = 'Network error') {
    super();
  }
}
