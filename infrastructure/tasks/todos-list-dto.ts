import type { TodoDto } from './todo-dto';

export interface TodosListDto {
  todos: TodoDto[];
  total: number;
  skip: number;
  limit: number;
}
