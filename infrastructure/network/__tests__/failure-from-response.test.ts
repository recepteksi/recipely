import {
  ConflictFailure,
  ForbiddenFailure,
  NotFoundFailure,
  RateLimitFailure,
  ServerFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';
import { failureFromResponse } from '@infrastructure/network/failure-from-response';

const withCode = (code: string, message = 'msg', field?: string): unknown => ({
  error: { code, message, field },
});

describe('failureFromResponse — backend error code takes precedence', () => {
  it.each([
    ['validation', ValidationFailure],
    ['unprocessable', ValidationFailure],
    ['unauthorized', UnauthorizedFailure],
    ['forbidden', ForbiddenFailure],
    ['not_found', NotFoundFailure],
    ['conflict', ConflictFailure],
    ['rate_limit', RateLimitFailure],
    ['too_many_requests', RateLimitFailure],
    ['server', ServerFailure],
    ['internal', ServerFailure],
  ])('maps code "%s" to the matching Failure subtype', (code, Type) => {
    const failure = failureFromResponse(400, withCode(code));
    expect(failure).toBeInstanceOf(Type);
    expect(failure.message).toBe('msg');
  });

  it('carries the validation field through', () => {
    const failure = failureFromResponse(400, withCode('validation', 'Bad', 'servings'));
    expect(failure).toBeInstanceOf(ValidationFailure);
    expect((failure as ValidationFailure).field).toBe('servings');
  });

  it('carries the conflict field through', () => {
    const failure = failureFromResponse(409, withCode('conflict', 'Taken', 'email'));
    expect((failure as ConflictFailure).field).toBe('email');
  });
});

describe('failureFromResponse — status fallback when no envelope code', () => {
  it.each([
    [401, UnauthorizedFailure],
    [403, ForbiddenFailure],
    [404, NotFoundFailure],
    [409, ConflictFailure],
    [429, RateLimitFailure],
    [400, ValidationFailure],
    [422, ValidationFailure],
    [500, ServerFailure],
    [503, ServerFailure],
  ])('maps status %s to the matching Failure subtype', (status, Type) => {
    expect(failureFromResponse(status, {})).toBeInstanceOf(Type);
  });

  it('falls back to UnknownFailure for an unmapped status', () => {
    expect(failureFromResponse(300, {})).toBeInstanceOf(UnknownFailure);
  });

  it('preserves the originating status on a ServerFailure', () => {
    const failure = failureFromResponse(503, {});
    expect((failure as ServerFailure).status).toBe(503);
  });

  it('uses the envelope message when present, else an HTTP placeholder', () => {
    expect(failureFromResponse(404, { error: { message: 'No recipe' } }).message).toBe('No recipe');
    expect(failureFromResponse(404, {}).message).toBe('HTTP 404');
  });
});
