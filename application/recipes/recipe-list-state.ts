import type { Failure } from '@core/failure';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

export type RecipeListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipes: RecipeSummary[] }
  | { status: 'error'; failure: Failure };
