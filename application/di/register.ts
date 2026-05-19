import type { Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import { SignInUseCase } from '@application/auth/sign-in-use-case';
import { SignUpUseCase } from '@application/auth/sign-up-use-case';
import { SignOutUseCase } from '@application/auth/sign-out-use-case';
import { GetSessionUseCase } from '@application/auth/get-session-use-case';
import { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';
import { GetRecipeUseCase } from '@application/recipes/get-recipe-use-case';
import { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
import { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import { DeleteRecipeUseCase } from '@application/recipes/delete-recipe-use-case';
import { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import { configureAuthStore, type AuthStore } from '@application/auth/auth-store';
import {
  configureRecipeListStore,
  type RecipeListStore,
} from '@application/recipes/recipe-list-store';
import {
  configureRecipeDetailStore,
  type RecipeDetailStore,
} from '@application/recipes/recipe-detail-store';
import {
  configureSavedRecipesStore,
  type SavedRecipesStore,
} from '@application/recipes/saved-recipes-store';
import {
  configureCreatedRecipesStore,
  type CreatedRecipesStore,
} from '@application/recipes/created-recipes-store';
import {
  configureFavoritesStore,
  type FavoritesStore,
} from '@application/favorites/favorites-store';
import { ListCommentsUseCase } from '@application/comments/list-comments-use-case';
import { AddCommentUseCase } from '@application/comments/add-comment-use-case';
import { DeleteCommentUseCase } from '@application/comments/delete-comment-use-case';
import {
  configureCommentsStore,
  type CommentsStore,
} from '@application/comments/comments-store';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';
import { LikeRecipeUseCase } from '@application/likes/like-recipe-use-case';
import { UnlikeRecipeUseCase } from '@application/likes/unlike-recipe-use-case';
import {
  configureLikesStore,
  type LikesStore,
} from '@application/likes/likes-store';

export interface ApplicationStores {
  authStore: AuthStore;
  recipeListStore: RecipeListStore;
  recipeDetailStore: RecipeDetailStore;
  savedRecipesStore: SavedRecipesStore;
  createdRecipesStore: CreatedRecipesStore;
  favoritesStore: FavoritesStore;
  commentsStore: CommentsStore;
  likesStore: LikesStore;
  loadFavoritesUseCase: LoadFavoritesUseCase;
}

export const registerApplication = (container: Container): ApplicationStores => {
  const authRepo = container.resolve<IAuthRepository>(TOKENS.AuthRepository);
  const recipeRepo = container.resolve<IRecipeRepository>(TOKENS.RecipeRepository);
  const signIn = new SignInUseCase(authRepo);
  const signUp = new SignUpUseCase(authRepo);
  const signOut = new SignOutUseCase(authRepo);
  const getSession = new GetSessionUseCase(authRepo);
  const listRecipes = new ListRecipesUseCase(recipeRepo);
  const getRecipe = new GetRecipeUseCase(recipeRepo);
  const createRecipeUseCase = new CreateRecipeUseCase(recipeRepo);
  const listMyRecipesUseCase = new ListMyRecipesUseCase(recipeRepo);
  const generateRecipeUseCase = new GenerateRecipeUseCase(recipeRepo);
  const updateRecipeUseCase = new UpdateRecipeUseCase(recipeRepo);
  const deleteRecipeUseCase = new DeleteRecipeUseCase(recipeRepo);
  const commentRepo = container.resolve<ICommentRepository>(TOKENS.CommentRepository);
  const listCommentsUseCase = new ListCommentsUseCase(commentRepo);
  const addCommentUseCase = new AddCommentUseCase(commentRepo);
  const deleteCommentUseCase = new DeleteCommentUseCase(commentRepo);

  const addFavoriteUseCase = container.resolve<AddFavoriteUseCase>(TOKENS.AddFavoriteUseCase);
  const removeFavoriteUseCase = container.resolve<RemoveFavoriteUseCase>(TOKENS.RemoveFavoriteUseCase);
  const loadFavoritesUseCase = container.resolve<LoadFavoritesUseCase>(TOKENS.LoadFavoritesUseCase);
  const likeRecipeUseCase = container.resolve<LikeRecipeUseCase>(TOKENS.LikeRecipeUseCase);
  const unlikeRecipeUseCase = container.resolve<UnlikeRecipeUseCase>(TOKENS.UnlikeRecipeUseCase);

  const savedRecipesStore = configureSavedRecipesStore();
  const authStore = configureAuthStore({ signIn, signUp, signOut, getSession, loadFavorites: loadFavoritesUseCase, savedRecipesStore });
  const recipeListStore = configureRecipeListStore({ listRecipes });
  const recipeDetailStore = configureRecipeDetailStore({ getRecipe });
  const favoritesStore = configureFavoritesStore({
    addFavoriteUseCase,
    removeFavoriteUseCase,
    savedRecipesStore,
  });
  const createdRecipesStore = configureCreatedRecipesStore({
    createRecipeUseCase,
    listMyRecipesUseCase,
    generateRecipeUseCase,
    updateRecipeUseCase,
    deleteRecipeUseCase,
  });
  const commentsStore = configureCommentsStore({
    listComments: listCommentsUseCase,
    addComment: addCommentUseCase,
    deleteComment: deleteCommentUseCase,
  });
  const likesStore = configureLikesStore({
    likeRecipe: likeRecipeUseCase,
    unlikeRecipe: unlikeRecipeUseCase,
  });
  return {
    authStore,
    recipeListStore,
    recipeDetailStore,
    savedRecipesStore,
    createdRecipesStore,
    favoritesStore,
    commentsStore,
    likesStore,
    loadFavoritesUseCase,
  };
};
