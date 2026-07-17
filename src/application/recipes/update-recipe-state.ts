import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type UpdateRecipeState =
  | { status: 'idle' }
  | { status: 'updating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };
