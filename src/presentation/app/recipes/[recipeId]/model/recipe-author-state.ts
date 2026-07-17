import type { ResolvedAuthor } from '@presentation/app/recipes/[recipeId]/model/resolved-author';

export type RecipeAuthorState =
  | { status: 'loading' }
  | { status: 'resolved'; author: ResolvedAuthor }
  | { status: 'unavailable' };
