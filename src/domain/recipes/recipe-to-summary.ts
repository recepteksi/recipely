import type { Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import { RecipeSummary } from '@domain/recipes/recipe-summary';

/**
 * Converts a full-detail `Recipe` into a lean `RecipeSummary`, so an
 * owner-mutation flow (e.g. after `updateRecipe`) can patch a
 * `RecipeSummary[]` list cache in place without a network round-trip.
 * `totalTimeMinutes` is derived by summing `prepTimeMinutes` +
 * `cookTimeMinutes`, since detail flows only carry those two fields.
 */
export const recipeToSummary = (recipe: Recipe): Result<RecipeSummary, ValidationFailure> => {
  return RecipeSummary.create({
    id: recipe.id,
    name: recipe.name,
    image: recipe.image,
    cuisine: recipe.cuisine,
    category: recipe.category,
    difficulty: recipe.difficulty,
    totalTimeMinutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
    rating: recipe.rating,
    moderationStatus: recipe.moderationStatus,
    likeCount: recipe.likeCount,
    likedByMe: recipe.likedByMe,
    commentCount: recipe.commentCount,
    viewCount: recipe.viewCount,
  });
};
