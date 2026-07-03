import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type RecipeDetailState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipe: Recipe }
  | { status: 'error'; failure: Failure };
