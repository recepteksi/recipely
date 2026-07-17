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

const withKey = (code: string, messageKey: string, message = 'msg'): unknown => ({
  error: { code, message, messageKey },
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

describe('failureFromResponse — messageKey threading', () => {
  it.each([
    ['validation', 'errors.validation.prompt_required'],
    ['unprocessable', 'errors.ai.prompt_rejected'],
    ['unauthorized', 'errors.unauthorized.invalid_token'],
    ['forbidden', 'errors.forbidden.not_owner'],
    ['not_found', 'errors.import.no_recipe_found'],
    ['conflict', 'errors.conflict.email_exists'],
    ['rate_limit', 'errors.too_many_requests.ai_cooldown'],
    ['too_many_requests', 'errors.too_many_requests.ai_cooldown'],
    ['server', 'errors.internal.unexpected'],
    ['internal', 'errors.internal.unexpected'],
  ])('carries the key through the "%s" code branch', (code, messageKey) => {
    expect(failureFromResponse(400, withKey(code, messageKey)).messageKey).toBe(messageKey);
  });

  it.each([
    [401, 'errors.unauthorized.invalid_token'],
    [403, 'errors.forbidden.not_owner'],
    [404, 'errors.import.no_recipe_found'],
    [409, 'errors.conflict.email_exists'],
    [429, 'errors.too_many_requests.ai_cooldown'],
    [500, 'errors.internal.unexpected'],
    [422, 'errors.ai.invalid_response'],
    [300, 'errors.internal.unexpected'],
  ])('carries the key through the status-%s fallback branch (no envelope code)', (status, messageKey) => {
    expect(failureFromResponse(status, { error: { message: 'msg', messageKey } }).messageKey)
      .toBe(messageKey);
  });

  it('separates two 422s that share a code but mean different things', () => {
    // The whole point of the field: `code` alone maps both of these to
    // ValidationFailure, so only the key can drive distinct user-facing copy.
    const rejected = failureFromResponse(422, withKey('unprocessable', 'errors.ai.prompt_rejected'));
    const invalid = failureFromResponse(422, withKey('unprocessable', 'errors.ai.invalid_response'));

    expect(rejected).toBeInstanceOf(ValidationFailure);
    expect(invalid).toBeInstanceOf(ValidationFailure);
    expect(rejected.code).toBe(invalid.code);
    expect(rejected.messageKey).toBe('errors.ai.prompt_rejected');
    expect(invalid.messageKey).toBe('errors.ai.invalid_response');
  });

  it('leaves messageKey undefined when an older backend omits it', () => {
    // Backward compatibility: the field is additive, a pre-catalogue backend
    // sends none, and mapping must still yield the same subtype and message.
    const failure = failureFromResponse(409, withCode('conflict', 'Taken', 'email'));

    expect(failure).toBeInstanceOf(ConflictFailure);
    expect(failure.message).toBe('Taken');
    expect(failure.messageKey).toBeUndefined();
    expect(failureFromResponse(500, {}).messageKey).toBeUndefined();
    expect(failureFromResponse(404, 'not even an object').messageKey).toBeUndefined();
  });

  it('keeps field and status alongside the key', () => {
    const validation = failureFromResponse(400, {
      error: { code: 'validation', message: 'Bad', field: 'servings', messageKey: 'errors.validation.servings' },
    });
    expect((validation as ValidationFailure).field).toBe('servings');
    expect(validation.messageKey).toBe('errors.validation.servings');

    const server = failureFromResponse(503, withKey('internal', 'errors.internal.unexpected'));
    expect((server as ServerFailure).status).toBe(503);
    expect(server.messageKey).toBe('errors.internal.unexpected');
  });
});
