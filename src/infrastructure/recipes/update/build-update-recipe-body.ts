import type { UpdateRecipeInput } from '@domain/recipes/update/update-recipe-input';
import { ValueConstants } from '@core/constants';

/**
 * Builds the JSON body for `PATCH /recipes/:id` from the scalar fields of an
 * update input. Only defined fields are copied so the backend performs a true
 * partial update; media is resolved separately (it may require an upload round
 * trip) and merged into the returned object by the caller.
 */
export const buildUpdateRecipeBody = (
  input: UpdateRecipeInput,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body['name'] = input.name;
  if (input.cuisine !== undefined) body['cuisine'] = input.cuisine;
  if (input.category !== undefined) body['category'] = input.category;
  if (input.difficulty !== undefined) body['difficulty'] = input.difficulty;
  if (input.ingredients !== undefined) body['ingredients'] = input.ingredients;
  if (input.instructions !== undefined) body['instructions'] = input.instructions;
  if (input.prepTimeMinutes !== undefined) body['prepTimeMinutes'] = input.prepTimeMinutes;
  if (input.cookTimeMinutes !== undefined) body['cookTimeMinutes'] = input.cookTimeMinutes;
  if (input.servings !== undefined) body['servings'] = input.servings;
  if (input.rating !== undefined) body['rating'] = input.rating;
  if (input.tags !== undefined) body['tags'] = input.tags;
  if (
    input.mealType !== undefined &&
    Object.values(input.mealType).some((arr) => arr.length > ValueConstants.zero)
  ) {
    body['mealType'] = input.mealType;
  }
  if (input.isPublished !== undefined) body['isPublished'] = input.isPublished;
  if (input.locale !== undefined) body['locale'] = input.locale;
  return body;
};
