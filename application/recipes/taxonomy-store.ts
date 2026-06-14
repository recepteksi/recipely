import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { TaxonomyItem } from '@domain/recipes/taxonomy-item';
import type { LoadTaxonomyUseCase } from '@application/recipes/load-taxonomy-use-case';

export type TaxonomyStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TaxonomyStoreState {
  cuisines: readonly TaxonomyItem[];
  categories: readonly TaxonomyItem[];
  status: TaxonomyStatus;
  failure: Failure | null;
  /**
   * Loads the cuisine + category catalogs. Idempotent: a no-op while already
   * `loading` or once `ready`, so screens can call it freely on mount without
   * triggering duplicate fetches.
   */
  load: () => Promise<void>;
}

export interface TaxonomyStoreDeps {
  loadTaxonomyUseCase: LoadTaxonomyUseCase;
}

export type TaxonomyStore = UseBoundStore<StoreApi<TaxonomyStoreState>>;

export const configureTaxonomyStore = (deps: TaxonomyStoreDeps): TaxonomyStore => {
  return create<TaxonomyStoreState>((set, get) => ({
    cuisines: [],
    categories: [],
    status: 'idle',
    failure: null,
    load: async () => {
      const { status } = get();
      if (status === 'loading' || status === 'ready') {
        return;
      }
      set({ status: 'loading', failure: null });
      const result = await deps.loadTaxonomyUseCase.execute();
      if (!result.ok) {
        set({ status: 'error', failure: result.failure });
        return;
      }
      set({
        cuisines: result.value.cuisines,
        categories: result.value.categories,
        status: 'ready',
        failure: null,
      });
    },
  }));
};
