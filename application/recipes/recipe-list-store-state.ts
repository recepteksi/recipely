import type { Recipe } from '@domain/recipes/recipe';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { RecipeListState } from '@application/recipes/recipe-list-state';

export interface RecipeListStoreState {
  state: RecipeListState;
  load: (filters?: RecipeFilters) => Promise<void>;
  replace: (recipe: Recipe) => void;
  remove: (id: string) => void;
}
