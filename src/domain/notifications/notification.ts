import { Entity } from '@core/entity/entity';
import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

export interface NotificationProps {
  id: string;
  type: string;
  senderId: string | null;
  senderDisplayName: string | null;
  senderPhotoUrl: string | null;
  recipeId: string | null;
  recipeTitle: string | null;
  message: string | null;
  read: boolean;
  createdAt: Date;
}

/**
 * Domain entity representing a backend notification (comment, like, follow,
 * AI completion, etc.). Validates that `id` is non-empty before construction.
 */
export class Notification extends Entity<NotificationProps> {
  private constructor(props: NotificationProps) {
    super(props);
  }

  static create(props: NotificationProps): Result<Notification, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('Notification id must be non-empty', 'id'));
    }
    return ok(new Notification(props));
  }

  get type(): string {
    return this.props.type;
  }

  get senderId(): string | null {
    return this.props.senderId;
  }

  get senderDisplayName(): string | null {
    return this.props.senderDisplayName;
  }

  get senderPhotoUrl(): string | null {
    return this.props.senderPhotoUrl;
  }

  get recipeId(): string | null {
    return this.props.recipeId;
  }

  get recipeTitle(): string | null {
    return this.props.recipeTitle;
  }

  /** Free-text payload (e.g. the comment body); null for types without text. */
  get message(): string | null {
    return this.props.message;
  }

  get read(): boolean {
    return this.props.read;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
