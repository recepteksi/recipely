import type { Failure } from '@core/failure';

export type DraftsListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded' }
  | { status: 'error'; failure: Failure };
