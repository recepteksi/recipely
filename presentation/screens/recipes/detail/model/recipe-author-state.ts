import type { ResolvedAuthor } from '@presentation/screens/recipes/detail/model/resolved-author';

export type RecipeAuthorState =
  | { status: 'loading' }
  | { status: 'resolved'; author: ResolvedAuthor }
  | { status: 'unavailable' };
