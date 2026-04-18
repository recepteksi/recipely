import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly raw: string) {}

  static create(raw: string): Result<Email, ValidationFailure> {
    if (!EMAIL_REGEX.test(raw)) {
      return fail(new ValidationFailure('Invalid email format', 'email'));
    }
    return ok(new Email(raw));
  }

  get value(): string {
    return this.raw;
  }
}
