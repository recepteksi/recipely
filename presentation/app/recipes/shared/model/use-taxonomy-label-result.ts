import type { TaxonomyLabel } from '@presentation/app/recipes/shared/model/taxonomy-label';

export interface UseTaxonomyLabelResult {
  cuisineLabel: (key: string) => TaxonomyLabel;
  categoryLabel: (key: string) => TaxonomyLabel;
}
