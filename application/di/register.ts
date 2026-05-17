import type { Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { ITaskRepository } from '@domain/tasks/i-task-repository';
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
import { ListTasksUseCase } from '@application/tasks/list-tasks-use-case';
import { GetTaskUseCase } from '@application/tasks/get-task-use-case';
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
  configureTaskListStore,
  type TaskListStore,
} from '@application/tasks/task-list-store';
import {
  configureTaskDetailStore,
  type TaskDetailStore,
} from '@application/tasks/task-detail-store';
import {
  configureFavoritesStore,
  type FavoritesStore,
} from '@application/favorites/favorites-store';

export interface ApplicationStores {
  authStore: AuthStore;
  recipeListStore: RecipeListStore;
  recipeDetailStore: RecipeDetailStore;
  savedRecipesStore: SavedRecipesStore;
  createdRecipesStore: CreatedRecipesStore;
  taskListStore: TaskListStore;
  taskDetailStore: TaskDetailStore;
  favoritesStore: FavoritesStore;
  loadFavoritesUseCase: LoadFavoritesUseCase;
}

export const registerApplication = (container: Container): ApplicationStores => {
  const authRepo = container.resolve<IAuthRepository>(TOKENS.AuthRepository);
  const recipeRepo = container.resolve<IRecipeRepository>(TOKENS.RecipeRepository);
  const taskRepo = container.resolve<ITaskRepository>(TOKENS.TaskRepository);

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
  const listTasks = new ListTasksUseCase(taskRepo);
  const getTask = new GetTaskUseCase(taskRepo);
  const addFavoriteUseCase = container.resolve<AddFavoriteUseCase>(TOKENS.AddFavoriteUseCase);
  const removeFavoriteUseCase = container.resolve<RemoveFavoriteUseCase>(TOKENS.RemoveFavoriteUseCase);
  const loadFavoritesUseCase = container.resolve<LoadFavoritesUseCase>(TOKENS.LoadFavoritesUseCase);

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
  const taskListStore = configureTaskListStore({ listTasks });
  const taskDetailStore = configureTaskDetailStore({ getTask });

  return {
    authStore,
    recipeListStore,
    recipeDetailStore,
    savedRecipesStore,
    createdRecipesStore,
    taskListStore,
    taskDetailStore,
    favoritesStore,
    loadFavoritesUseCase,
  };
};
