import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';

export type AuthStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'unauthenticated' }
  | { status: 'error'; failure: Failure };
