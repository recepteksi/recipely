import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Task } from '@domain/tasks/task';
import type { GetTaskUseCase } from '@application/tasks/get-task-use-case';

export type TaskDetailState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; task: Task }
  | { status: 'error'; failure: Failure };

export interface TaskDetailStoreState {
  byKey: Record<string, TaskDetailState>;
  load: (recipeId: string, taskId: string) => Promise<void>;
}

export interface TaskDetailStoreDeps {
  getTask: GetTaskUseCase;
}

export type TaskDetailStore = UseBoundStore<StoreApi<TaskDetailStoreState>>;

const makeKey = (recipeId: string, taskId: string): string => `${recipeId}:${taskId}`;

export const configureTaskDetailStore = (
  deps: TaskDetailStoreDeps,
): TaskDetailStore => {
  return create<TaskDetailStoreState>((set, get) => ({
    byKey: {},
    load: async (recipeId: string, taskId: string) => {
      const key = makeKey(recipeId, taskId);
      set({ byKey: { ...get().byKey, [key]: { status: 'loading' } } });
      const result = await deps.getTask.execute(recipeId, taskId);
      if (!result.ok) {
        set({
          byKey: { ...get().byKey, [key]: { status: 'error', failure: result.failure } },
        });
        return;
      }
      set({
        byKey: { ...get().byKey, [key]: { status: 'loaded', task: result.value } },
      });
    },
  }));
};
