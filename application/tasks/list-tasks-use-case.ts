import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Task } from '@domain/tasks/task';
import type { ITaskRepository } from '@domain/tasks/i-task-repository';

export class ListTasksUseCase {
  constructor(private readonly repo: ITaskRepository) {}

  execute(recipeId: string): Promise<Result<Task[], Failure>> {
    return this.repo.listTasks(recipeId);
  }
}
