import { useEffect } from 'react';
import { RecipeCard } from '@presentation/base/widgets/recipe-card';
import { useStores } from '@presentation/bootstrap/stores-context';
import type { Recipe } from '@domain/recipes/recipe';

export interface RecipeListItemProps {
  recipe: Recipe;
  onPress: () => void;
}

/**
 * Wraps `RecipeCard` with reactive per-recipe like state from `likesStore`.
 * Seeding happens on mount so the store is populated before the card renders.
 */
export const RecipeListItem = ({ recipe, onPress }: RecipeListItemProps): React.JSX.Element => {
  const { likesStore, authStore } = useStores();
  const authState = authStore((s) => s.state);
  const isAuthenticated = authState.status === 'authenticated';

  const likeState = likesStore((s) => s.byRecipe[recipe.id]);
  const seed = likesStore((s) => s.seed);
  const toggle = likesStore((s) => s.toggle);

  useEffect(() => {
    seed(recipe.id, recipe.likeCount, recipe.likedByMe);
  }, [recipe.id, recipe.likeCount, recipe.likedByMe, seed]);

  return (
    <RecipeCard
      name={recipe.name}
      image={recipe.image}
      cuisine={recipe.cuisine}
      difficulty={recipe.difficulty}
      rating={recipe.rating}
      tags={recipe.tags}
      likeCount={likeState?.likeCount ?? recipe.likeCount}
      likedByMe={likeState?.likedByMe ?? recipe.likedByMe}
      onPress={onPress}
      onLike={isAuthenticated ? () => void toggle(recipe.id) : undefined}
    />
  );
};
