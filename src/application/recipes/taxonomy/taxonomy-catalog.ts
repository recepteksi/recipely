import type { TaxonomyItem } from '@domain/recipes/taxonomy/taxonomy-item';

/** The combined taxonomy catalog returned by `LoadTaxonomyUseCase`. */
export interface TaxonomyCatalog {
  cuisines: TaxonomyItem[];
  categories: TaxonomyItem[];
}
