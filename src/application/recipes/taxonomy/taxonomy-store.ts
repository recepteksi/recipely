import type { StoreApi, UseBoundStore } from 'zustand';
import type { TaxonomyStoreState } from '@application/recipes/taxonomy/taxonomy-store-state';

/** Bound Zustand store handle produced by `configureTaxonomyStore`. */
export type TaxonomyStore = UseBoundStore<StoreApi<TaxonomyStoreState>>;
