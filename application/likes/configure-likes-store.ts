import { create } from 'zustand';
import { ok } from '@core/result/result';
import type { RecipeLikeState } from '@application/likes/recipe-like-state';
import type { LikesStoreState } from '@application/likes/likes-store-state';
import type { LikesStoreDeps } from '@application/likes/likes-store-deps';
import type { LikesStore } from '@application/likes/likes-store';

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

    syncFromApi: (recipeId, likeCount, likedByMe) => {
      // WHY: skip when an optimistic toggle is in-flight — we don't want a
      // concurrent detail-fetch to clobber the count the user just changed.
      const current = get().byRecipe[recipeId];
      if (current?.isLoading) return;
      // WHY: skip when values are identical — calling set() unconditionally
      // triggers a re-render on every call, which feeds an infinite loop when
      // the caller's useEffect has a non-primitive dependency on recipeState.
      if (
        current !== undefined &&
        current.likeCount === likeCount &&
        current.likedByMe === likedByMe
      )
        return;
      set((s) => ({
        byRecipe: {
          ...s.byRecipe,
          [recipeId]: { likeCount, likedByMe, isLoading: false },
        },
      }));
    },

    toggle: async (recipeId) => {
      const current = get().byRecipe[recipeId];
      if (!current || current.isLoading) return ok(undefined);

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

      return result;
    },
  }));
