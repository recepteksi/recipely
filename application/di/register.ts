import type { Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { ITaskRepository } from '@domain/tasks/i-task-repository';
import { SignInUseCase } from '@application/auth/sign-in-use-case';
import { SignOutUseCase } from '@application/auth/sign-out-use-case';
import { GetSessionUseCase } from '@application/auth/get-session-use-case';
import { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';
import { GetRecipeUseCase } from '@application/recipes/get-recipe-use-case';
import { ListTasksUseCase } from '@application/tasks/list-tasks-use-case';
import { GetTaskUseCase } from '@application/tasks/get-task-use-case';
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
  configureTaskListStore,
  type TaskListStore,
} from '@application/tasks/task-list-store';
import {
  configureTaskDetailStore,
  type TaskDetailStore,
} from '@application/tasks/task-detail-store';

export interface ApplicationStores {
  authStore: AuthStore;
  recipeListStore: RecipeListStore;
  recipeDetailStore: RecipeDetailStore;
  taskListStore: TaskListStore;
  taskDetailStore: TaskDetailStore;
}

export const registerApplication = (container: Container): ApplicationStores => {
  const authRepo = container.resolve<IAuthRepository>(TOKENS.AuthRepository);
  const recipeRepo = container.resolve<IRecipeRepository>(TOKENS.RecipeRepository);
  const taskRepo = container.resolve<ITaskRepository>(TOKENS.TaskRepository);

  const signIn = new SignInUseCase(authRepo);
  const signOut = new SignOutUseCase(authRepo);
  const getSession = new GetSessionUseCase(authRepo);
  const listRecipes = new ListRecipesUseCase(recipeRepo);
  const getRecipe = new GetRecipeUseCase(recipeRepo);
  const listTasks = new ListTasksUseCase(taskRepo);
  const getTask = new GetTaskUseCase(taskRepo);

  const authStore = configureAuthStore({ signIn, signOut, getSession });
  const recipeListStore = configureRecipeListStore({ listRecipes });
  const recipeDetailStore = configureRecipeDetailStore({ getRecipe });
  const taskListStore = configureTaskListStore({ listTasks });
  const taskDetailStore = configureTaskDetailStore({ getTask });

  return {
    authStore,
    recipeListStore,
    recipeDetailStore,
    taskListStore,
    taskDetailStore,
  };
};
