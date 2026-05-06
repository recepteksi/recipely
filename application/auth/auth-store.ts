import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { SignInUseCase } from '@application/auth/sign-in-use-case';
import type { SignUpUseCase } from '@application/auth/sign-up-use-case';
import type { SignOutUseCase } from '@application/auth/sign-out-use-case';
import type { GetSessionUseCase } from '@application/auth/get-session-use-case';
import type { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import type { SavedRecipesStore } from '@application/recipes/saved-recipes-store';

export type AuthStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'unauthenticated' }
  | { status: 'error'; failure: Failure };

export interface AuthStoreState {
  state: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export interface AuthStoreDeps {
  signIn: SignInUseCase;
  signUp: SignUpUseCase;
  signOut: SignOutUseCase;
  getSession: GetSessionUseCase;
  loadFavorites: LoadFavoritesUseCase;
  savedRecipesStore: SavedRecipesStore;
}

export type AuthStore = UseBoundStore<StoreApi<AuthStoreState>>;

export const configureAuthStore = (deps: AuthStoreDeps): AuthStore => {
  return create<AuthStoreState>((set) => ({
    state: { status: 'idle' },

    hydrate: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.getSession.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      if (result.value === null || result.value.isExpired()) {
        set({ state: { status: 'unauthenticated' } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
      // Pre-load favorites in background
      try {
        // eslint-disable-next-line no-console
        console.log('[AuthStore] hydrate: loading favorites...');
        const favResult = await deps.loadFavorites.execute();
        if (favResult.ok) {
          // eslint-disable-next-line no-console
          console.log('[AuthStore] hydrate: favorites loaded:', Array.from(favResult.value));
          const { setSavedIds } = deps.savedRecipesStore.getState();
          setSavedIds(favResult.value);
        } else {
          // eslint-disable-next-line no-console
          console.error('[AuthStore] hydrate: failed to load favorites:', favResult.failure);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[AuthStore] hydrate: error loading favorites:', e);
      }
    },

    signIn: async (email: string, password: string) => {
      set({ state: { status: 'loading' } });
      const result = await deps.signIn.execute(email, password);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
    },

    register: async (email: string, password: string, displayName: string) => {
      set({ state: { status: 'loading' } });
      const result = await deps.signUp.execute(email, password, displayName);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
    },

    signOut: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.signOut.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'unauthenticated' } });
    },
  }));
};
