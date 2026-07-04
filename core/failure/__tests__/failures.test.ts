import {
  ConflictFailure,
  ForbiddenFailure,
  NetworkFailure,
  NotFoundFailure,
  RateLimitFailure,
  ServerFailure,
  TimeoutFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';

describe('Failure hierarchy — stable codes', () => {
  it('each subtype exposes its stable machine code', () => {
    expect(new NetworkFailure().code).toBe('network');
    expect(new TimeoutFailure().code).toBe('timeout');
    expect(new UnauthorizedFailure().code).toBe('unauthorized');
    expect(new ForbiddenFailure().code).toBe('forbidden');
    expect(new NotFoundFailure().code).toBe('not_found');
    expect(new ValidationFailure('x').code).toBe('validation');
    expect(new ConflictFailure().code).toBe('conflict');
    expect(new RateLimitFailure().code).toBe('rate_limit');
    expect(new ServerFailure().code).toBe('server');
    expect(new UnknownFailure().code).toBe('unknown');
  });

  it('carries optional structured detail', () => {
    expect(new ConflictFailure('Taken', 'email').field).toBe('email');
    expect(new RateLimitFailure('Slow', 30).retryAfterSeconds).toBe(30);
    expect(new ServerFailure('Down', 503).status).toBe(503);
    expect(new ValidationFailure('Bad', 'servings').field).toBe('servings');
  });

  it('provides sensible default messages', () => {
    expect(new TimeoutFailure().message.length).toBeGreaterThan(0);
    expect(new ForbiddenFailure().message.length).toBeGreaterThan(0);
  });
});

describe('ValidationFailure.fieldErrors', () => {
  it('treats a single-field message with no separators as one fieldless entry', () => {
    // WHY: fieldErrors parses only `message`, not the constructor's `field`
    // argument — a message with no `': '` in it never recovers a field, even
    // though the failure itself carries one via `.field`.
    const f = new ValidationFailure('Recipe id must be non-empty', 'id');

    expect(f.fieldErrors).toEqual([{ message: 'Recipe id must be non-empty' }]);
    expect(f.field).toBe('id');
  });

  it('splits a multi-field message into per-field entries', () => {
    const f = new ValidationFailure('name: too short; category: invalid');

    expect(f.fieldErrors).toEqual([
      { field: 'name', message: 'too short' },
      { field: 'category', message: 'invalid' },
    ]);
  });

  it('treats a segment with no field prefix as fieldless, even alongside fielded segments', () => {
    const f = new ValidationFailure('name: too short; a general problem');

    expect(f.fieldErrors).toEqual([
      { field: 'name', message: 'too short' },
      { message: 'a general problem' },
    ]);
  });
});
