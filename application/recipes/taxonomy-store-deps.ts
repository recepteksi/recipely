import type { LoadTaxonomyUseCase } from '@application/recipes/load-taxonomy-use-case';

export interface TaxonomyStoreDeps {
  loadTaxonomyUseCase: LoadTaxonomyUseCase;
}
