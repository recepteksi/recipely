import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Value object wrapping a validated email address string. Use `Email.create` to
 * parse and validate; the constructor is intentionally private to prevent
 * unvalidated instances from being created.
 */
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
