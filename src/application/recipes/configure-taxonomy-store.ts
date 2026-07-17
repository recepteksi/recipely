import { create } from 'zustand';
import type { TaxonomyStoreState } from '@application/recipes/taxonomy-store-state';
import type { TaxonomyStoreDeps } from '@application/recipes/taxonomy-store-deps';
import type { TaxonomyStore } from '@application/recipes/taxonomy-store';

export const configureTaxonomyStore = (deps: TaxonomyStoreDeps): TaxonomyStore => {
  const fetchCatalogs = async (
    set: (partial: Partial<TaxonomyStoreState>) => void,
  ): Promise<void> => {
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
  };

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
      await fetchCatalogs(set);
    },
    reload: async () => {
      if (get().status === 'loading') {
        return;
      }
      await fetchCatalogs(set);
    },
  }));
};
