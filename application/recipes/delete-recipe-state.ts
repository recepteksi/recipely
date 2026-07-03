import type { Failure } from '@core/failure';

export type DeleteRecipeState =
  | { status: 'idle' }
  | { status: 'deleting' }
  | { status: 'success' }
  | { status: 'error'; failure: Failure };
