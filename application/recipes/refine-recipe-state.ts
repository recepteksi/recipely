import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type RefineRecipeState =
  | { status: 'idle' }
  | { status: 'refining' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };
