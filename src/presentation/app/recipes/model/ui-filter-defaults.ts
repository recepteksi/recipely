import type { UiFilters } from '@presentation/app/recipes/model/ui-filters';
import { ValueConstants } from '@core/constants';
import { PresentationValueConstants } from '@presentation/base/constants';

/** An empty {@link UiFilters} selection (nothing applied). */
export const emptyFilters: UiFilters = {
  cuisines: [],
  categories: [],
  difficulties: [],
  maxTime: ValueConstants.zero,
};

/** Max total-time chip options (minutes); `0` means "any". */
export const TIME_OPTIONS: readonly number[] = PresentationValueConstants.filterTimeOptionsMinutes;
