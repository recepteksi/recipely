import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type TrendingRecipesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipes: Recipe[] }
  | { status: 'error'; failure: Failure };
