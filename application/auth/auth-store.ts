import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import type { SignInUseCase } from '@application/auth/sign-in-use-case';
import type { RequestRegistrationUseCase } from '@application/auth/request-registration-use-case';
import type { VerifyRegistrationUseCase } from '@application/auth/verify-registration-use-case';
import type { ResendRegistrationCodeUseCase } from '@application/auth/resend-registration-code-use-case';
import type { SignOutUseCase } from '@application/auth/sign-out-use-case';
import type { GetSessionUseCase } from '@application/auth/get-session-use-case';
import type { SignInWithGoogleUseCase } from '@application/auth/sign-in-with-google-use-case';
import type { SignInWithAppleUseCase } from '@application/auth/sign-in-with-apple-use-case';
import type { RequestPasswordResetUseCase } from '@application/auth/request-password-reset-use-case';
import type { ResetPasswordUseCase } from '@application/auth/reset-password-use-case';
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
  /**
   * Requests a verification code email. Returns the challenge (email +
   * code TTL) on success so the caller can open the verify-code step, or
   * `null` on failure (the error lands in `state`).
   */
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<RegistrationChallenge | null>;
  /** Confirms the emailed code and, on success, authenticates the session. */
  verifyRegistration: (email: string, code: string) => Promise<void>;
  /** Re-sends the registration code; returns the refreshed challenge or `null`. */
  resendRegistrationCode: (email: string) => Promise<RegistrationChallenge | null>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  /** Sends a reset-link email; returns true on success so the screen can show the "check your inbox" view. */
  requestPasswordReset: (email: string) => Promise<boolean>;
  /** Completes a password reset; returns null on success or the Failure so the screen can show a specific message. */
  resetPassword: (token: string, newPassword: string) => Promise<Failure | null>;
}

export interface AuthStoreDeps {
  signIn: SignInUseCase;
  requestRegistration: RequestRegistrationUseCase;
  verifyRegistration: VerifyRegistrationUseCase;
  resendRegistrationCode: ResendRegistrationCodeUseCase;
  signOut: SignOutUseCase;
  getSession: GetSessionUseCase;
  loadFavorites: LoadFavoritesUseCase;
  savedRecipesStore: SavedRecipesStore;
  signInWithGoogle: SignInWithGoogleUseCase;
  signInWithApple: SignInWithAppleUseCase;
  requestPasswordReset: RequestPasswordResetUseCase;
  resetPassword: ResetPasswordUseCase;
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
         
        console.log('[AuthStore] hydrate: loading favorites...');
        const favResult = await deps.loadFavorites.execute();
        if (favResult.ok) {
           
          console.log('[AuthStore] hydrate: favorites loaded:', Array.from(favResult.value));
          const { setSavedIds } = deps.savedRecipesStore.getState();
          setSavedIds(favResult.value);
        } else {
           
          console.error('[AuthStore] hydrate: failed to load favorites:', favResult.failure);
        }
      } catch (e) {
         
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
      const result = await deps.requestRegistration.execute(email, password, displayName);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return null;
      }
      // Account is not created yet — the user must confirm the emailed code.
      set({ state: { status: 'unauthenticated' } });
      return result.value;
    },

    verifyRegistration: async (email: string, code: string) => {
      set({ state: { status: 'loading' } });
      const result = await deps.verifyRegistration.execute(email, code);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
    },

    resendRegistrationCode: async (email: string) => {
      const result = await deps.resendRegistrationCode.execute(email);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return null;
      }
      return result.value;
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

    signInWithGoogle: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.signInWithGoogle.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
    },

    signInWithApple: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.signInWithApple.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'authenticated', session: result.value } });
    },

    requestPasswordReset: async (email: string) => {
      const result = await deps.requestPasswordReset.execute(email);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return false;
      }
      return true;
    },

    resetPassword: async (token: string, newPassword: string) => {
      const result = await deps.resetPassword.execute(token, newPassword);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return result.failure;
      }
      return null;
    },
  }));
};
