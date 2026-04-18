import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

export interface TaskProps {
  id: string;
  recipeId: string;
  title: string;
  completed: boolean;
}

export class Task extends Entity<TaskProps> {
  private constructor(props: TaskProps) {
    super(props);
  }

  static create(props: TaskProps): Result<Task, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('Task id must be non-empty', 'id'));
    }
    if (props.recipeId.trim().length === 0) {
      return fail(new ValidationFailure('Task recipeId must be non-empty', 'recipeId'));
    }
    if (props.title.trim().length === 0) {
      return fail(new ValidationFailure('Task title must be non-empty', 'title'));
    }
    return ok(new Task(props));
  }

  get recipeId(): string {
    return this.props.recipeId;
  }
  get title(): string {
    return this.props.title;
  }
  get completed(): boolean {
    return this.props.completed;
  }
}
