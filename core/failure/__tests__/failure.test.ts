import {
  Failure,
  NetworkFailure,
  NotFoundFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';

describe('Failure subclasses', () => {
  it('each carries its own discriminator code', () => {
    expect(new NetworkFailure().code).toBe('network');
    expect(new UnauthorizedFailure().code).toBe('unauthorized');
    expect(new NotFoundFailure().code).toBe('not_found');
    expect(new ValidationFailure('m').code).toBe('validation');
    expect(new UnknownFailure().code).toBe('unknown');
  });

  it('ValidationFailure preserves optional field', () => {
    const f = new ValidationFailure('bad email', 'email');

    expect(f.field).toBe('email');
    expect(f.message).toBe('bad email');
  });

  it('UnknownFailure preserves wrapped cause', () => {
    const cause = new Error('root');
    const f = new UnknownFailure('wrap', cause);

    expect(f.cause).toBe(cause);
  });

  it('discriminated union narrows on code', () => {
    const describeFailure = (f: Failure): string => {
      switch (f.code) {
        case 'network':
          return 'net';
        case 'unauthorized':
          return 'auth';
        case 'not_found':
          return '404';
        case 'validation':
          return 'val';
        case 'unknown':
          return 'unk';
        default:
          return 'other';
      }
    };

    expect(describeFailure(new NetworkFailure())).toBe('net');
    expect(describeFailure(new ValidationFailure('x'))).toBe('val');
  });
});
