import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { LikeRecipeUseCase } from '@application/likes/like-recipe-use-case';
import type { UnlikeRecipeUseCase } from '@application/likes/unlike-recipe-use-case';

export interface RecipeLikeState {
  likeCount: number;
  likedByMe: boolean;
  isLoading: boolean;
}

export interface LikesStoreState {
  /** Per-recipe like state overlay. Keyed by recipe id. */
  byRecipe: Record<string, RecipeLikeState>;
  /**
   * Seed the store with the like state that arrived from the API. No-op when
   * the entry is already present so that in-flight optimistic updates are not
   * overwritten by a stale network response.
   */
  seed: (recipeId: string, likeCount: number, likedByMe: boolean) => void;
  /** Toggle like with optimistic update; rolls back on failure. */
  toggle: (recipeId: string) => Promise<void>;
}

export type LikesStore = UseBoundStore<StoreApi<LikesStoreState>>;

export interface LikesStoreDeps {
  likeRecipe: LikeRecipeUseCase;
  unlikeRecipe: UnlikeRecipeUseCase;
}

export const configureLikesStore = (deps: LikesStoreDeps): LikesStore =>
  create<LikesStoreState>((set, get) => ({
    byRecipe: {},

    seed: (recipeId, likeCount, likedByMe) => {
      if (get().byRecipe[recipeId] !== undefined) return;
      set((s) => ({
        byRecipe: {
          ...s.byRecipe,
          [recipeId]: { likeCount, likedByMe, isLoading: false },
        },
      }));
    },

    toggle: async (recipeId) => {
      const current = get().byRecipe[recipeId];
      if (!current || current.isLoading) return;

      const wasLiked = current.likedByMe;
      const optimistic: RecipeLikeState = {
        likeCount: wasLiked ? current.likeCount - 1 : current.likeCount + 1,
        likedByMe: !wasLiked,
        isLoading: true,
      };

      set((s) => ({ byRecipe: { ...s.byRecipe, [recipeId]: optimistic } }));

      const result = wasLiked
        ? await deps.unlikeRecipe.execute(recipeId)
        : await deps.likeRecipe.execute(recipeId);

      set((s) => ({
        byRecipe: {
          ...s.byRecipe,
          [recipeId]: result.ok
            ? { ...optimistic, isLoading: false }
            : { ...current, isLoading: false }, // rollback
        },
      }));
    },
  }));
