import type { ListCommentsUseCase } from '@application/comments/list-comments-use-case';
import type { AddCommentUseCase } from '@application/comments/add-comment-use-case';
import type { DeleteCommentUseCase } from '@application/comments/delete-comment-use-case';
import type { LikeCommentUseCase } from '@application/comments/like-comment-use-case';
import type { UnlikeCommentUseCase } from '@application/comments/unlike-comment-use-case';

export interface ConfigureCommentsStoreOptions {
  listComments: ListCommentsUseCase;
  addComment: AddCommentUseCase;
  deleteComment: DeleteCommentUseCase;
  likeComment: LikeCommentUseCase;
  unlikeComment: UnlikeCommentUseCase;
}
