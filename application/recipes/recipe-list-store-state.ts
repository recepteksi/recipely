import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { RecipeListState } from '@application/recipes/recipe-list-state';

export interface RecipeListStoreState {
  state: RecipeListState;
  load: (filters?: RecipeFilters) => Promise<void>;
  replace: (recipe: RecipeSummary) => void;
  remove: (id: string) => void;
}
