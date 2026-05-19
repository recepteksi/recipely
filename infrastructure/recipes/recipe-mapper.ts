import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type { MediaItem } from '@domain/recipes/media-item';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

/**
 * Maps a `RecipeDto` from the API into a domain `Recipe` entity. When the
 * backend sends a `media[]` array it is used directly; otherwise the cover
 * `image` is promoted into a single-item gallery so `MediaGallery` always
 * has at least one item to render.
 */
// WHY: domain's Recipe uses a plain string for difficulty; no need to promote the
// backend's string-union into a domain enum just to swap a remote.
export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => {
  const media: MediaItem[] =
    dto.media && dto.media.length > 0
      ? dto.media.map((m) => ({ type: m.type, url: m.url }))
      : [{ type: 'image', url: dto.image }];

  return Recipe.create({
    id: dto.id,
    name: dto.name,
    cuisine: dto.cuisine,
    difficulty: dto.difficulty,
    ingredients: dto.ingredients,
    instructions: dto.instructions,
    prepTimeMinutes: dto.prepTimeMinutes,
    cookTimeMinutes: dto.cookTimeMinutes,
    image: dto.image,
    media,
    rating: dto.rating,
    tags: dto.tags,
    mealType: dto.mealType,
    ownerId: dto.ownerId,
    likeCount: dto.likeCount ?? 0,
    likedByMe: dto.likedByMe ?? false,
  });
};
