import type { Recipe } from '@domain/recipes/recipe';
import type { RecipeDetailState } from '@application/recipes/recipe-detail-state';

export interface RecipeDetailStoreState {
  byId: Record<string, RecipeDetailState>;
  load: (id: string) => Promise<void>;
  replace: (recipe: Recipe) => void;
  remove: (id: string) => void;
}
