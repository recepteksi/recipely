import type { TaxonomyItem } from '@domain/recipes/taxonomy-item';

export interface Catalog {
  items: readonly TaxonomyItem[];
  title: string;
}
