import type { Comment } from '@domain/comments/comment';

export interface CommentPage {
  items: Comment[];
  total: number;
  page: number;
  pageSize: number;
}
