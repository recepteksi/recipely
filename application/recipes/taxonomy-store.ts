import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { TaxonomyStoreState } from '@application/recipes/taxonomy-store-state';
import type { TaxonomyStoreDeps } from '@application/recipes/taxonomy-store-deps';

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
