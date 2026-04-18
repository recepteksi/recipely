import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { Task } from '@domain/tasks/task';
import type { ITaskRepository } from '@domain/tasks/i-task-repository';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { TodoDto } from '@infrastructure/tasks/todo-dto';
import type { TodosListDto } from '@infrastructure/tasks/todos-list-dto';
import { toTask } from '@infrastructure/tasks/task-mapper';

const TODOS_PER_RECIPE = 5;

export class TaskRepository implements ITaskRepository {
  constructor(private readonly http: HttpClient) {}

  async listTasks(recipeId: string): Promise<Result<Task[], Failure>> {
    const recipeNum = Number(recipeId);
    const skip = Number.isFinite(recipeNum) ? (recipeNum - 1) * TODOS_PER_RECIPE : 0;
    const result = await this.http.request<TodosListDto>({
      method: 'GET',
      url: '/todos',
      params: { limit: TODOS_PER_RECIPE, skip },
    });
    if (!result.ok) {
      return result;
    }
    const tasks: Task[] = [];
    for (const dto of result.value.todos) {
      const mapped = toTask(dto, recipeId);
      if (!mapped.ok) {
        return fail(mapped.failure);
      }
      tasks.push(mapped.value);
    }
    return ok(tasks);
  }

  async getTask(recipeId: string, taskId: string): Promise<Result<Task, Failure>> {
    const result = await this.http.request<TodoDto>({
      method: 'GET',
      url: `/todos/${encodeURIComponent(taskId)}`,
    });
    if (!result.ok) {
      return result;
    }
    const mapped = toTask(result.value, recipeId);
    if (!mapped.ok) {
      return fail(mapped.failure);
    }
    return ok(mapped.value);
  }
}
