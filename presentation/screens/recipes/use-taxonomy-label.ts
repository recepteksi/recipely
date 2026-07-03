import { useMemo } from 'react';
import { useStores } from '@presentation/bootstrap/stores-context';
import { t } from '@presentation/i18n';
import type { TaxonomyItem } from '@domain/recipes/taxonomy-item';
import { CUISINE_EMOJI } from '@presentation/screens/create-recipe/cuisine-emoji';
import { CATEGORY_EMOJI } from '@presentation/screens/create-recipe/category-emoji';
import { TAXONOMY_PLACEHOLDER_EMOJI } from '@presentation/screens/create-recipe/taxonomy-placeholder';
import type { TaxonomyLabel } from '@presentation/screens/recipes/taxonomy-label';
import type { UseTaxonomyLabelResult } from '@presentation/screens/recipes/use-taxonomy-label-result';

const toMap = (items: readonly TaxonomyItem[]): Map<string, TaxonomyItem> =>
  new Map(items.map((item) => [item.key, item]));

/** First non-empty value, treating `undefined`/`''` as a miss. */
const firstNonEmpty = (...values: (string | undefined)[]): string | undefined =>
  values.find((v) => v !== undefined && v.length > 0);

/**
 * Resolves a recipe's cuisine/category `key` to a localized name + emoji,
 * preferring the backend taxonomy store and falling back to the bundled local
 * emoji maps + i18n names when the store has no entry (store not yet `ready`,
 * offline, or an unknown/legacy key). The store entries already carry
 * `Accept-Language`-localized names, so they win when present.
 */
export const useTaxonomyLabel = (): UseTaxonomyLabelResult => {
  const { taxonomyStore } = useStores();
  const cuisines = taxonomyStore((s) => s.cuisines);
  const categories = taxonomyStore((s) => s.categories);

  const cuisineMap = useMemo(() => toMap(cuisines), [cuisines]);
  const categoryMap = useMemo(() => toMap(categories), [categories]);

  return useMemo(() => {
    const tr = t();
    const cuisineNames = tr.cuisineNames as Record<string, string | undefined>;
    const categoryNames = tr.categoryNames as Record<string, string | undefined>;
    const cuisineEmoji = CUISINE_EMOJI as Record<string, string | undefined>;
    const categoryEmoji = CATEGORY_EMOJI as Record<string, string | undefined>;

    const cuisineLabel = (key: string): TaxonomyLabel => {
      const fromStore = cuisineMap.get(key);
      return {
        name: firstNonEmpty(fromStore?.name, cuisineNames[key]) ?? key,
        emoji: firstNonEmpty(fromStore?.emoji, cuisineEmoji[key]) ?? TAXONOMY_PLACEHOLDER_EMOJI,
      };
    };

    const categoryLabel = (key: string): TaxonomyLabel => {
      const fromStore = categoryMap.get(key);
      return {
        name: firstNonEmpty(fromStore?.name, categoryNames[key]) ?? key,
        emoji: firstNonEmpty(fromStore?.emoji, categoryEmoji[key]) ?? TAXONOMY_PLACEHOLDER_EMOJI,
      };
    };

    return { cuisineLabel, categoryLabel };
  }, [cuisineMap, categoryMap]);
};
