import type { Difficulty } from '@domain/recipes/difficulty';

/**
 * The recipe-list screen's in-UI filter selection (cuisines, categories,
 * difficulties, and a max total-time cap). Mapped to {@link RecipeFilters} for
 * the API on apply; `maxTime === 0` means "any".
 */
export interface UiFilters {
  cuisines: string[];
  categories: string[];
  difficulties: Difficulty[];
  maxTime: number;
}

/** An empty {@link UiFilters} selection (nothing applied). */
export const emptyFilters: UiFilters = {
  cuisines: [],
  categories: [],
  difficulties: [],
  maxTime: 0,
};

/** Max total-time chip options (minutes); `0` means "any". */
export const TIME_OPTIONS: readonly number[] = [0, 15, 30, 45, 60, 90];
