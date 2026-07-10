import { create } from 'zustand';
import { ok, type Result } from '@core/result/result';
import { UnknownFailure, type Failure } from '@core/failure';
import type { Comment } from '@domain/comments/comment';
import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';
import type { CommentsStoreState } from '@application/comments/comments-store-state';
import type { ConfigureCommentsStoreOptions } from '@application/comments/configure-comments-store-options';
import type { CommentsStore } from '@application/comments/comments-store';

const DEFAULT_PAGE_SIZE = 20;

const defaultRecipeState = (): RecipeCommentsState => ({
  items: [],
  total: 0,
  page: 1,
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
});

export const configureCommentsStore = (deps: ConfigureCommentsStoreOptions): CommentsStore => {
  const { listComments, addComment, deleteComment, likeComment, unlikeComment } = deps;

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

    toggleLike: async (recipeId: string, commentId: string): Promise<Result<void, Failure>> => {
      const existing = get().byRecipe[recipeId];
      const original = existing?.items.find((c) => c.id === commentId);
      if (!existing || !original) {
        return ok(undefined);
      }

      const wasLiked = original.likedByMe;
      const optimistic = original.withLikeToggled();

      const replace = (target: Comment) =>
        set((state) => {
          const current = state.byRecipe[recipeId];
          if (!current) {
            return {};
          }
          return {
            byRecipe: {
              ...state.byRecipe,
              [recipeId]: {
                ...current,
                items: current.items.map((c) => (c.id === commentId ? target : c)),
              },
            },
          };
        });

      replace(optimistic);

      const result = wasLiked
        ? await unlikeComment.execute(recipeId, commentId)
        : await likeComment.execute(recipeId, commentId);

      if (!result.ok) {
        replace(original); // rollback
      }

      return result;
    },
  }));
};
