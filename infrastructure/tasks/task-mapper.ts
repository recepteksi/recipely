import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Task } from '@domain/tasks/task';
import type { TodoDto } from '@infrastructure/tasks/todo-dto';

export const toTask = (dto: TodoDto, recipeId: string): Result<Task, ValidationFailure> => {
  return Task.create({
    id: String(dto.id),
    recipeId,
    title: dto.todo,
    completed: dto.completed,
  });
};
