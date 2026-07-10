import { create } from 'zustand';
import type { AuthStoreState } from '@application/auth/auth-store-state';
import type { AuthStoreDeps } from '@application/auth/auth-store-deps';
import type { AuthStore } from '@application/auth/auth-store';

export const configureAuthStore = (deps: AuthStoreDeps): AuthStore => {
  return create<AuthStoreState>((set, get) => ({
    state: { status: 'idle' },

    expireSession: async () => {
      // Only an authenticated session can expire — never clobber idle/loading/
      // login flows (a 401 during sign-in is a harmless no-op here).
      if (get().state.status !== 'authenticated') {
        return;
      }
      // Clear the persisted session regardless of the Result — we are logging
      // out either way; the routing decision is driven by the store status.
      await deps.signOut.execute();
      set({ state: { status: 'unauthenticated' } });
      deps.savedRecipesStore.getState().setSavedIds(new Set());
    },

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

    uploadAvatar: async (fileUri: string, fileName: string, mimeType: string) => {
      const result = await deps.uploadAvatar.execute(fileUri, fileName, mimeType);
      if (!result.ok) {
        // The user is still authenticated — surface the failure to the screen
        // without clobbering the session state.
        return result.failure;
      }
      set({ state: { status: 'authenticated', session: result.value } });
      return null;
    },

    updateProfile: async (input: { displayName?: string; bio?: string }) => {
      const result = await deps.updateProfile.execute(input);
      if (!result.ok) {
        // The user is still authenticated — surface the failure to the screen
        // without clobbering the session state.
        return result.failure;
      }
      set({ state: { status: 'authenticated', session: result.value } });
      return null;
    },

    deleteAccount: async () => {
      const result = await deps.deleteAccount.execute();
      if (!result.ok) {
        // The account was not deleted — keep the user signed in and surface the
        // failure to the screen without clobbering the session state.
        return result.failure;
      }
      set({ state: { status: 'unauthenticated' } });
      deps.savedRecipesStore.getState().setSavedIds(new Set());
      return null;
    },
  }));
};
