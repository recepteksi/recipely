import type { Failure } from '@core/failure';
import type { UserProfile } from '@domain/user-profile/user-profile';

export type UserProfileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; profile: UserProfile }
  | { status: 'error'; failure: Failure };
