import type { UserProfileState } from '@application/user-profile/user-profile-state';

export interface UserProfileStoreState {
  state: UserProfileState;
  load: (userId: string) => Promise<void>;
  reset: () => void;
}
