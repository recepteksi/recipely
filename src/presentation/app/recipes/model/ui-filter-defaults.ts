import type { UiFilters } from '@presentation/app/recipes/model/ui-filters';

/** An empty {@link UiFilters} selection (nothing applied). */
export const emptyFilters: UiFilters = {
  cuisines: [],
  categories: [],
  difficulties: [],
  maxTime: 0,
};

/** Max total-time chip options (minutes); `0` means "any". */
export const TIME_OPTIONS: readonly number[] = [0, 15, 30, 45, 60, 90];
