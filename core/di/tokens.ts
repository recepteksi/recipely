export type Token<T> = symbol & { readonly __type?: T };

export const TOKENS = {
  HttpClient: Symbol.for('HttpClient'),
  SecureStorage: Symbol.for('SecureStorage'),
  AuthRepository: Symbol.for('AuthRepository'),
  RecipeRepository: Symbol.for('RecipeRepository'),
  FavoritesRepository: Symbol.for('FavoritesRepository'),
  AddFavoriteUseCase: Symbol.for('AddFavoriteUseCase'),
  RemoveFavoriteUseCase: Symbol.for('RemoveFavoriteUseCase'),
  LoadFavoritesUseCase: Symbol.for('LoadFavoritesUseCase'),
  HealthCheckService: Symbol.for('HealthCheckService'),
  CommentRepository: Symbol.for('CommentRepository'),
  LikeRepository: Symbol.for('LikeRepository'),
  LikeRecipeUseCase: Symbol.for('LikeRecipeUseCase'),
  UnlikeRecipeUseCase: Symbol.for('UnlikeRecipeUseCase'),
} as const;
