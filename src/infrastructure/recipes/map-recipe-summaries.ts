import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { RecipeListItemDto } from '@infrastructure/recipes/dtos/recipe-list-item-dto';
import { toRecipeSummary } from '@infrastructure/recipes/recipe-mapper';

/**
 * Maps a page of lean recipe list DTOs to domain `RecipeSummary` values,
 * short-circuiting with the first mapping failure so a single malformed item
 * never yields a partially-populated list.
 */
export const mapRecipeSummaries = (
  items: RecipeListItemDto[],
): Result<RecipeSummary[], Failure> => {
  const summaries: RecipeSummary[] = [];
  for (const dto of items) {
    const mapped = toRecipeSummary(dto);
    if (!mapped.ok) {
      return fail(mapped.failure);
    }
    summaries.push(mapped.value);
  }
  return ok(summaries);
};
