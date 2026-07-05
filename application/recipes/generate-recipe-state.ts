import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export type GenerateRecipeState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };
