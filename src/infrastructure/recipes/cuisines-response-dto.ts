import type { TaxonomyItemDto } from '@infrastructure/recipes/taxonomy-item-dto';

/** Response body of `GET /recipes/cuisines`. */
export interface CuisinesResponseDto {
  cuisines: TaxonomyItemDto[];
}
