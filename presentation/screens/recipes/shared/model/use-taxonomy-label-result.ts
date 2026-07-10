import type { TaxonomyLabel } from '@presentation/screens/recipes/shared/model/taxonomy-label';

export interface UseTaxonomyLabelResult {
  cuisineLabel: (key: string) => TaxonomyLabel;
  categoryLabel: (key: string) => TaxonomyLabel;
}
