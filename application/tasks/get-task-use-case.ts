import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Task } from '@domain/tasks/task';
import type { ITaskRepository } from '@domain/tasks/i-task-repository';

export class GetTaskUseCase {
  constructor(private readonly repo: ITaskRepository) {}

  execute(recipeId: string, taskId: string): Promise<Result<Task, Failure>> {
    return this.repo.getTask(recipeId, taskId);
  }
}
