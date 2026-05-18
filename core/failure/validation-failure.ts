import { Failure } from './failure';

/**
 * Failure produced when user-supplied input does not pass domain or API
 * validation rules. The optional `field` names the offending input so the UI
 * can highlight the correct form control.
 */
export class ValidationFailure extends Failure {
  readonly code = 'validation';
  constructor(
    readonly message: string,
    readonly field?: string,
  ) {
    super();
  }
}
