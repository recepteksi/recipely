import {
  ConflictFailure,
  NetworkFailure,
  UnauthorizedFailure,
  ValidationFailure,
} from '@core/failure';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { en } from '@presentation/i18n/en';

describe('authFormMessage', () => {
  it('uses the contextual override for the matching failure code', () => {
    expect(
      authFormMessage(new UnauthorizedFailure(), {
        unauthorized: 'Wrong email or password',
      }),
    ).toBe('Wrong email or password');

    expect(
      authFormMessage(new ConflictFailure(), { conflict: 'Email taken' }),
    ).toBe('Email taken');
  });

  it('falls back to the class-based short copy when the code is not overridden', () => {
    expect(
      authFormMessage(new NetworkFailure(), { unauthorized: 'irrelevant' }),
    ).toBe(en.errors.network.short);

    expect(authFormMessage(new ValidationFailure('x'), {})).toBe(
      en.errors.validation.short,
    );
  });
});
