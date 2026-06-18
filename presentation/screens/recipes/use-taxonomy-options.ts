import { useMemo } from 'react';
import { useStores } from '@presentation/bootstrap/stores-context';
import { CUISINE_KEY_VALUES } from '@domain/recipes/cuisine-key';
import { RECIPE_CATEGORY_VALUES } from '@domain/recipes/recipe-category';

/** The cuisine/category keys to offer as selectable filter/strip options. */
export interface TaxonomyOptions {
  cuisineKeys: readonly string[];
  categoryKeys: readonly string[];
}

/**
 * Resolves which cuisine/category keys to *offer* as options: the full backend
 * catalog (44 / 31) once the taxonomy store is `ready`, otherwise the bundled
 * local enum values (15 / 11) so the filters are never empty before the store
 * loads, while offline, or on error. Display names/emojis are resolved
 * separately via {@link useTaxonomyLabel}.
 */
export const useTaxonomyOptions = (): TaxonomyOptions => {
  const { taxonomyStore } = useStores();
  const status = taxonomyStore((s) => s.status);
  const cuisines = taxonomyStore((s) => s.cuisines);
  const categories = taxonomyStore((s) => s.categories);

  return useMemo(() => {
    const ready = status === 'ready';
    return {
      cuisineKeys:
        ready && cuisines.length > 0 ? cuisines.map((c) => c.key) : CUISINE_KEY_VALUES,
      categoryKeys:
        ready && categories.length > 0 ? categories.map((c) => c.key) : RECIPE_CATEGORY_VALUES,
    };
  }, [status, cuisines, categories]);
};
