import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Task } from '@domain/tasks/task';

export interface ITaskRepository {
  listTasks(recipeId: string): Promise<Result<Task[], Failure>>;
  getTask(recipeId: string, taskId: string): Promise<Result<Task, Failure>>;
}
