import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Task } from '@domain/tasks/task';
import type { ListTasksUseCase } from '@application/tasks/list-tasks-use-case';

export type TaskListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; tasks: Task[] }
  | { status: 'error'; failure: Failure };

export interface TaskListStoreState {
  byRecipeId: Record<string, TaskListState>;
  load: (recipeId: string) => Promise<void>;
}

export interface TaskListStoreDeps {
  listTasks: ListTasksUseCase;
}

export type TaskListStore = UseBoundStore<StoreApi<TaskListStoreState>>;

export const configureTaskListStore = (
  deps: TaskListStoreDeps,
): TaskListStore => {
  return create<TaskListStoreState>((set, get) => ({
    byRecipeId: {},
    load: async (recipeId: string) => {
      set({ byRecipeId: { ...get().byRecipeId, [recipeId]: { status: 'loading' } } });
      const result = await deps.listTasks.execute(recipeId);
      if (!result.ok) {
        set({
          byRecipeId: {
            ...get().byRecipeId,
            [recipeId]: { status: 'error', failure: result.failure },
          },
        });
        return;
      }
      set({
        byRecipeId: {
          ...get().byRecipeId,
          [recipeId]: { status: 'loaded', tasks: result.value },
        },
      });
    },
  }));
};
