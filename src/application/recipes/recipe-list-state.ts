import type { Failure } from '@core/failure';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

export type RecipeListState =
  | { status: 'idle' }
  | { status: 'loading' }
  // WHY: `isRefreshing`/`refreshFailure` let a filter change on an already
  // -loaded list keep the previous `recipes` on screen while a new page
  // fetches, instead of dropping back to a bare `loading` state with no
  // data. `recipes` is always readable here regardless of whether a
  // refresh is in flight, so screens don't need to branch on refreshing
  // vs. loaded just to render the list.
  | {
      status: 'loaded';
      recipes: RecipeSummary[];
      isRefreshing?: boolean;
      refreshFailure?: Failure;
    }
  | { status: 'error'; failure: Failure };
