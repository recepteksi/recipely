import type { ResolvedAuthor } from '@presentation/screens/recipes/resolved-author';

export type RecipeAuthorState =
  | { status: 'loading' }
  | { status: 'resolved'; author: ResolvedAuthor }
  | { status: 'unavailable' };
