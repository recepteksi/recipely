import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

export interface CommentProps {
  id: string;
  body: string;
  authorId: string;
  recipeId: string;
  createdAt: Date;
}

export class Comment extends Entity<CommentProps> {
  private constructor(props: CommentProps) {
    super(props);
  }

  static create(props: CommentProps): Result<Comment, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('Comment id must be non-empty', 'id'));
    }
    if (props.body.trim().length === 0) {
      return fail(new ValidationFailure('Comment body must be non-empty', 'body'));
    }
    if (props.authorId.trim().length === 0) {
      return fail(new ValidationFailure('Comment authorId must be non-empty', 'authorId'));
    }
    if (props.recipeId.trim().length === 0) {
      return fail(new ValidationFailure('Comment recipeId must be non-empty', 'recipeId'));
    }
    return ok(new Comment(props));
  }

  get body(): string {
    return this.props.body;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get recipeId(): string {
    return this.props.recipeId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
