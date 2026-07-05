import type { TaxonomyLabel } from '@presentation/screens/recipes/taxonomy-label';

export interface UseTaxonomyLabelResult {
  cuisineLabel: (key: string) => TaxonomyLabel;
  categoryLabel: (key: string) => TaxonomyLabel;
}
