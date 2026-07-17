import { useEffect, useRef } from 'react';
import type { Failure } from '@presentation/base/types';
import { showErrorToast } from '@presentation/base/feedback/show-toast';

/**
 * Surfaces a background-refresh `Failure` (e.g. `state.refreshFailure` on the
 * recipe list, set when a filter/sort refetch fails while the stale list stays
 * on screen) as a toast — exactly once per occurrence.
 *
 * Fires only on an undefined -> defined transition: a failure that is already
 * present on mount is treated as pre-existing (not a fresh error) and never
 * toasted, and the same failure never re-toasts on subsequent renders while it
 * stays set. A later successful refresh clears the failure, re-arming the hook
 * for the next transition.
 */
export const useRefreshFailureToast = (failure: Failure | undefined): void => {
  const prevFailureRef = useRef<Failure | undefined>(failure);

  useEffect(() => {
    if (failure !== undefined && prevFailureRef.current === undefined) {
      showErrorToast(failure);
    }
    prevFailureRef.current = failure;
  }, [failure]);
};
