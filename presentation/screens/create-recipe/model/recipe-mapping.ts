import type { MediaItem } from '@domain/recipes/media-item';
import type { Recipe } from '@domain/recipes/recipe';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import { RecipeCategory } from '@domain/recipes/recipe-category';
import { Difficulty } from '@domain/recipes/difficulty';
import type { EditableRecipe } from '@presentation/screens/create-recipe/model/editable-recipe';

const DEFAULT_PREP = 15;
const DEFAULT_COOK = 20;
const DEFAULT_SERVINGS = 4;

/** A pristine, empty editable model for "start from blank". */
export const emptyEditable = (): EditableRecipe => ({
  name: '',
  cuisine: null,
  category: RecipeCategory.MainCourse,
  difficulty: Difficulty.Easy,
  prepTimeMinutes: DEFAULT_PREP,
  cookTimeMinutes: DEFAULT_COOK,
  servings: DEFAULT_SERVINGS,
  ingredients: [''],
  instructions: [''],
  media: [],
});

/**
 * Normalizes a persisted draft cuisine key for the editable model: any
 * non-empty key is preserved verbatim (the backend owns the catalog, so we
 * must not drop keys the local enum doesn't know), while an empty string
 * becomes `null` so the tile shows its "unselected" placeholder on resume.
 */
const draftCuisine = (text: string): string | null => {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/** Seeds the editable model from a generated/loaded `Recipe`. */
export const recipeToEditable = (
  recipe: Recipe,
  prevMedia: readonly MediaItem[],
): EditableRecipe => ({
  name: recipe.name,
  cuisine: recipe.cuisine,
  category: recipe.category,
  difficulty: recipe.difficulty,
  prepTimeMinutes: recipe.prepTimeMinutes > 0 ? recipe.prepTimeMinutes : DEFAULT_PREP,
  cookTimeMinutes: recipe.cookTimeMinutes > 0 ? recipe.cookTimeMinutes : DEFAULT_COOK,
  servings: recipe.servings > 0 ? recipe.servings : DEFAULT_SERVINGS,
  ingredients: recipe.ingredients.length > 0 ? [...recipe.ingredients] : [''],
  instructions: recipe.instructions.length > 0 ? [...recipe.instructions] : [''],
  media: recipe.media.length > 0 ? [...recipe.media] : [...prevMedia],
});

const isDifficulty = (value: string | undefined): value is Difficulty =>
  value === Difficulty.Easy || value === Difficulty.Medium || value === Difficulty.Hard;

/**
 * Rebuilds the editable model from a persisted draft snapshot. The snapshot
 * has no `category` field, so a resumed draft falls back to the default
 * category (it is only meaningful at publish time).
 */
export const snapshotToEditable = (snapshot: DraftRecipeSnapshot): EditableRecipe => {
  const base = emptyEditable();
  const media: MediaItem[] = (snapshot.media ?? [])
    .filter((m) => m.type === 'image')
    .map((m) => ({ type: 'image', url: m.url }));
  return {
    name: snapshot.name ?? base.name,
    cuisine: snapshot.cuisine !== undefined ? draftCuisine(snapshot.cuisine) : base.cuisine,
    category: base.category,
    difficulty: isDifficulty(snapshot.difficulty) ? snapshot.difficulty : base.difficulty,
    prepTimeMinutes: snapshot.prepTimeMinutes ?? base.prepTimeMinutes,
    cookTimeMinutes: snapshot.cookTimeMinutes ?? base.cookTimeMinutes,
    servings: snapshot.servings ?? base.servings,
    ingredients:
      snapshot.ingredients && snapshot.ingredients.length > 0
        ? [...snapshot.ingredients]
        : base.ingredients,
    instructions:
      snapshot.instructions && snapshot.instructions.length > 0
        ? [...snapshot.instructions]
        : base.instructions,
    media,
  };
};

/** Projects the editable model to the wire `DraftRecipeSnapshot`. */
export const editableToSnapshot = (recipe: EditableRecipe): DraftRecipeSnapshot => ({
  name: recipe.name,
  cuisine: recipe.cuisine ?? '',
  difficulty: recipe.difficulty,
  prepTimeMinutes: recipe.prepTimeMinutes,
  cookTimeMinutes: recipe.cookTimeMinutes,
  servings: recipe.servings,
  ingredients: recipe.ingredients.map((s) => s.trim()).filter((s) => s.length > 0),
  instructions: recipe.instructions.map((s) => s.trim()).filter((s) => s.length > 0),
  media: recipe.media
    .filter((m) => m.type === 'image')
    .map((m) => ({ type: m.type, url: m.url })),
});

/** True when the model has any user-meaningful content worth saving as a draft. */
export const editableHasContent = (recipe: EditableRecipe): boolean =>
  recipe.name.trim().length > 0 ||
  recipe.ingredients.some((s) => s.trim().length > 0) ||
  recipe.instructions.some((s) => s.trim().length > 0);
