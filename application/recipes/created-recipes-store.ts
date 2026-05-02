import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Recipe } from '@domain/recipes/recipe';

export interface CreatedRecipesStoreState {
  recipes: readonly Recipe[];
  add: (recipe: Recipe) => void;
  remove: (id: string) => void;
  findById: (id: string) => Recipe | undefined;
}

export type CreatedRecipesStore = UseBoundStore<StoreApi<CreatedRecipesStoreState>>;

export const configureCreatedRecipesStore = (): CreatedRecipesStore => {
  return create<CreatedRecipesStoreState>((set, get) => ({
    recipes: [],
    add: (recipe) => set((s) => ({ recipes: [recipe, ...s.recipes] })),
    remove: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
    findById: (id) => get().recipes.find((r) => r.id === id),
  }));
};
