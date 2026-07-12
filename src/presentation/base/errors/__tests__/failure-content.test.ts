import {
  type Failure,
  NetworkFailure,
  NotFoundFailure,
  RateLimitFailure,
  ServerFailure,
  ValidationFailure,
} from '@core/failure';
import {
  failureContent,
  failureIcon,
  failureSeverity,
  failureToastMessage,
} from '@presentation/base/errors/failure-lookups';
import { en } from '@presentation/i18n/en';

describe('failure-content resolver', () => {
  it('selects localized title/body from the failure class (not its raw message)', () => {
    const failure = new NetworkFailure('axios ECONNREFUSED 127.0.0.1');
    expect(failureContent(failure)).toEqual({
      title: en.errors.network.title,
      body: en.errors.network.body,
    });
    expect(failureToastMessage(failure)).toBe(en.errors.network.short);
  });

  it('selects severity from the failure class', () => {
    expect(failureSeverity(new NotFoundFailure())).toBe('neutral');
    expect(failureSeverity(new RateLimitFailure())).toBe('warning');
    expect(failureSeverity(new ServerFailure())).toBe('danger');
    expect(failureSeverity(new ValidationFailure('x'))).toBe('danger');
  });

  it('falls back to the unknown copy for an unrecognized code', () => {
    const weird = { code: 'totally_new', message: 'boom' } as unknown as Failure;
    expect(failureContent(weird)).toEqual({
      title: en.errors.unknown.title,
      body: en.errors.unknown.body,
    });
    expect(failureToastMessage(weird)).toBe(en.errors.unknown.short);
  });

  it('always resolves an icon name', () => {
    expect(failureIcon(new ValidationFailure('x')).length).toBeGreaterThan(0);
    expect(failureIcon({ code: 'totally_new', message: 'x' } as unknown as Failure).length).toBeGreaterThan(0);
  });
});
