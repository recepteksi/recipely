import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { UserProfile } from '@domain/user-profile/user-profile';
import type { GetUserProfileUseCase } from '@application/user-profile/get-user-profile-use-case';

export type UserProfileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; profile: UserProfile }
  | { status: 'error'; failure: Failure };

export interface UserProfileStoreState {
  state: UserProfileState;
  load: (userId: string) => Promise<void>;
  reset: () => void;
}

export interface UserProfileStoreDeps {
  getUserProfile: GetUserProfileUseCase;
}

export type UserProfileStore = UseBoundStore<StoreApi<UserProfileStoreState>>;

/**
 * Holds the currently-viewed user profile (typically the signed-in user).
 * The screen that mounts the profile is responsible for calling `load`; the
 * store is intentionally session-scoped and is cleared on sign-out via `reset`.
 */
export const configureUserProfileStore = (
  deps: UserProfileStoreDeps,
): UserProfileStore => {
  return create<UserProfileStoreState>((set) => ({
    state: { status: 'idle' },
    load: async (userId: string) => {
      set({ state: { status: 'loading' } });
      const result = await deps.getUserProfile.execute({ userId });
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'loaded', profile: result.value } });
    },
    reset: () => set({ state: { status: 'idle' } }),
  }));
};
