import type { TodoDto } from '@infrastructure/tasks/todo-dto';

export interface TodosListDto {
  todos: TodoDto[];
  total: number;
  skip: number;
  limit: number;
}
