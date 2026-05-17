import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { UnknownFailure, type Failure } from '@core/failure';
import type { Comment } from '@domain/comments/comment';
import type { ListCommentsUseCase } from '@application/comments/list-comments-use-case';
import type { AddCommentUseCase } from '@application/comments/add-comment-use-case';
import type { DeleteCommentUseCase } from '@application/comments/delete-comment-use-case';

const DEFAULT_PAGE_SIZE = 20;

export interface RecipeCommentsState {
  items: Comment[];
  total: number;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: Failure | null;
}

const defaultRecipeState = (): RecipeCommentsState => ({
  items: [],
  total: 0,
  page: 1,
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
});

export interface CommentsStoreState {
  byRecipe: Record<string, RecipeCommentsState>;
  load(recipeId: string): Promise<void>;
  loadMore(recipeId: string): Promise<void>;
  addComment(recipeId: string, body: string): Promise<boolean>;
  deleteComment(recipeId: string, commentId: string): Promise<boolean>;
}

export type CommentsStore = UseBoundStore<StoreApi<CommentsStoreState>>;

export interface ConfigureCommentsStoreOptions {
  listComments: ListCommentsUseCase;
  addComment: AddCommentUseCase;
  deleteComment: DeleteCommentUseCase;
}

export const configureCommentsStore = (deps: ConfigureCommentsStoreOptions): CommentsStore => {
  const { listComments, addComment, deleteComment } = deps;

  return create<CommentsStoreState>((set, get) => ({
    byRecipe: {},

    load: async (recipeId: string) => {
      set((state) => ({
        byRecipe: {
          ...state.byRecipe,
          [recipeId]: {
            ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
            isLoading: true,
            error: null,
          },
        },
      }));

      try {
        const result = await listComments.execute({ recipeId, page: 1, pageSize: DEFAULT_PAGE_SIZE });
        if (!result.ok) {
          set((state) => ({
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
                isLoading: false,
                error: result.failure,
              },
            },
          }));
          return;
        }
        set((state) => ({
          byRecipe: {
            ...state.byRecipe,
            [recipeId]: {
              ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
              items: result.value.items,
              total: result.value.total,
              page: 1,
              isLoading: false,
              error: null,
            },
          },
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((state) => ({
          byRecipe: {
            ...state.byRecipe,
            [recipeId]: {
              ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
              isLoading: false,
              error: new UnknownFailure(msg),
            },
          },
        }));
      }
    },

    loadMore: async (recipeId: string) => {
      const current = get().byRecipe[recipeId] ?? defaultRecipeState();
      if (current.isLoadingMore || current.items.length >= current.total) {
        return;
      }

      const nextPage = current.page + 1;
      set((state) => ({
        byRecipe: {
          ...state.byRecipe,
          [recipeId]: {
            ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
            isLoadingMore: true,
            error: null,
          },
        },
      }));

      try {
        const result = await listComments.execute({
          recipeId,
          page: nextPage,
          pageSize: DEFAULT_PAGE_SIZE,
        });
        if (!result.ok) {
          set((state) => ({
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
                isLoadingMore: false,
                error: result.failure,
              },
            },
          }));
          return;
        }
        set((state) => {
          const existing = state.byRecipe[recipeId] ?? defaultRecipeState();
          return {
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...existing,
                items: [...existing.items, ...result.value.items],
                total: result.value.total,
                page: nextPage,
                isLoadingMore: false,
                error: null,
              },
            },
          };
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((state) => ({
          byRecipe: {
            ...state.byRecipe,
            [recipeId]: {
              ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
              isLoadingMore: false,
              error: new UnknownFailure(msg),
            },
          },
        }));
      }
    },

    addComment: async (recipeId: string, body: string): Promise<boolean> => {
      set((state) => ({
        byRecipe: {
          ...state.byRecipe,
          [recipeId]: {
            ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
            isSubmitting: true,
            error: null,
          },
        },
      }));

      try {
        const result = await addComment.execute({ recipeId, body });
        if (!result.ok) {
          set((state) => ({
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
                isSubmitting: false,
                error: result.failure,
              },
            },
          }));
          return false;
        }
        set((state) => {
          const existing = state.byRecipe[recipeId] ?? defaultRecipeState();
          return {
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...existing,
                items: [result.value, ...existing.items],
                total: existing.total + 1,
                isSubmitting: false,
                error: null,
              },
            },
          };
        });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((state) => ({
          byRecipe: {
            ...state.byRecipe,
            [recipeId]: {
              ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
              isSubmitting: false,
              error: new UnknownFailure(msg),
            },
          },
        }));
        return false;
      }
    },

    deleteComment: async (recipeId: string, commentId: string): Promise<boolean> => {
      try {
        const result = await deleteComment.execute({ recipeId, commentId });
        if (!result.ok) {
          set((state) => ({
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
                error: result.failure,
              },
            },
          }));
          return false;
        }
        set((state) => {
          const existing = state.byRecipe[recipeId] ?? defaultRecipeState();
          return {
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...existing,
                items: existing.items.filter((c) => c.id !== commentId),
                total: Math.max(0, existing.total - 1),
                error: null,
              },
            },
          };
        });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((state) => ({
          byRecipe: {
            ...state.byRecipe,
            [recipeId]: {
              ...(state.byRecipe[recipeId] ?? defaultRecipeState()),
              error: new UnknownFailure(msg),
            },
          },
        }));
        return false;
      }
    },
  }));
};
