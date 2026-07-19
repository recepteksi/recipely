import type { LoadTaxonomyUseCase } from '@application/recipes/taxonomy/load-taxonomy-use-case';

export interface TaxonomyStoreDeps {
  loadTaxonomyUseCase: LoadTaxonomyUseCase;
}
