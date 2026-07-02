import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type { MediaItem } from '@domain/recipes/media-item';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

/**
 * Maps a `RecipeDto` from the API into a domain `Recipe` entity. When the
 * backend sends a `media[]` array it is used directly; otherwise the cover
 * `image` is promoted into a single-item gallery — but only when it is a real
 * (non-empty) URL. AI generate/refine previews ship `image: ''`, and promoting
 * that into a `[{ url: '' }]` item would defeat the create flow's add-photo
 * guard, so an empty cover maps to an empty gallery instead.
 */
export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => {
  const media: MediaItem[] =
    dto.media && dto.media.length > 0
      ? dto.media.map((m) => ({ type: m.type, url: m.url }))
      : dto.image.trim().length > 0
        ? [{ type: 'image', url: dto.image }]
        : [];

  return Recipe.create({
    id: dto.id,
    name: dto.name,
    cuisine: dto.cuisine,
    category: dto.category,
    difficulty: dto.difficulty,
    ingredients: dto.ingredients,
    instructions: dto.instructions,
    prepTimeMinutes: dto.prepTimeMinutes,
    cookTimeMinutes: dto.cookTimeMinutes,
    servings: dto.servings ?? 1,
    caloriesPerServing: dto.caloriesPerServing ?? 0,
    nutrition: dto.nutrition,
    image: dto.image,
    media,
    rating: dto.rating,
    tags: dto.tags,
    mealType: dto.mealType,
    ownerId: dto.ownerId,
    likeCount: dto.likeCount ?? 0,
    likedByMe: dto.likedByMe ?? false,
    viewCount: dto.viewCount ?? 0,
  });
};
