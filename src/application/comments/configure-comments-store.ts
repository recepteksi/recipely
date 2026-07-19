import { create } from 'zustand';
import type { CommentsStoreState } from '@application/comments/comments-store-state';
import type { ConfigureCommentsStoreOptions } from '@application/comments/configure-comments-store-options';
import type { CommentsStore } from '@application/comments/comments-store';
import { createLoadCommentsAction } from '@application/comments/create-load-comments-action';
import { createLoadMoreCommentsAction } from '@application/comments/create-load-more-comments-action';
import { createAddCommentAction } from '@application/comments/create-add-comment-action';
import { createDeleteCommentAction } from '@application/comments/create-delete-comment-action';
import { createToggleLikeAction } from '@application/comments/create-toggle-like-action';

/**
 * Assembles the comments store from its per-action factories. State is keyed by
 * recipe id so many recipes' comment threads coexist without interference.
 */
export const configureCommentsStore = (deps: ConfigureCommentsStoreOptions): CommentsStore => {
  const { listComments, addComment, deleteComment, likeComment, unlikeComment } = deps;

  return create<CommentsStoreState>((set, get) => ({
    byRecipe: {},
    load: createLoadCommentsAction(set, listComments),
    loadMore: createLoadMoreCommentsAction(set, get, listComments),
    addComment: createAddCommentAction(set, addComment),
    deleteComment: createDeleteCommentAction(set, deleteComment),
    toggleLike: createToggleLikeAction(set, get, likeComment, unlikeComment),
    clear: () => set({ byRecipe: {} }),
  }));
};
