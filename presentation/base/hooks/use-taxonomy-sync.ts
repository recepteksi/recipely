import { useEffect } from 'react';
import type { AuthStore } from '@application/auth/auth-store';
import type { TaxonomyStore } from '@application/recipes/taxonomy-store';

/**
 * Loads the backend cuisine + category catalogs once the user is authenticated,
 * so the bearer token is attached to the request. `load()` is idempotent (a
 * no-op while `loading` or once `ready`), so re-running on every auth change or
 * remount is safe. No-ops while signed out to avoid hitting the API anonymously.
 */
export const useTaxonomySync = (taxonomyStore: TaxonomyStore, authStore: AuthStore): void => {
  useEffect(() => {
    const maybeLoad = (): void => {
      if (authStore.getState().state.status !== 'authenticated') return;
      void taxonomyStore.getState().load();
    };

    maybeLoad();
    return authStore.subscribe(maybeLoad);
  }, [taxonomyStore, authStore]);
};
