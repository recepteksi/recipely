import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeSort } from '@domain/recipes/recipe-sort';

export interface RecipeFilters {
  search?: string;
  // Opaque taxonomy keys (backend owns the full catalog); not narrowed to the
  // local enums so newer backend cuisines/categories can be filtered on.
  cuisines?: string[];
  categories?: string[];
  difficulties?: Difficulty[];
  maxTime?: number;
  sort?: RecipeSort;
  sortOrder?: 'asc' | 'desc';
}
