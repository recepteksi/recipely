import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type CreateRecipeState =
  | { status: 'idle' }
  | { status: 'creating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };
