import type { LikeRecipeUseCase } from '@application/likes/like-recipe-use-case';
import type { UnlikeRecipeUseCase } from '@application/likes/unlike-recipe-use-case';

export interface LikesStoreDeps {
  likeRecipe: LikeRecipeUseCase;
  unlikeRecipe: UnlikeRecipeUseCase;
}
