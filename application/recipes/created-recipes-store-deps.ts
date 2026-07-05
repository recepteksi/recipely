import type { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import type { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
import type { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import type { ImportInstagramRecipeUseCase } from '@application/recipes/import-instagram-recipe-use-case';
import type { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import type { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import type { DeleteRecipeUseCase } from '@application/recipes/delete-recipe-use-case';
import type { RecipeListStore } from '@application/recipes/recipe-list-store';
import type { RecipeDetailStore } from '@application/recipes/recipe-detail-store';

export interface CreatedRecipesStoreDeps {
  createRecipeUseCase: CreateRecipeUseCase;
  listMyRecipesUseCase: ListMyRecipesUseCase;
  generateRecipeUseCase: GenerateRecipeUseCase;
  importInstagramRecipeUseCase: ImportInstagramRecipeUseCase;
  refineRecipeUseCase: RefineRecipeUseCase;
  updateRecipeUseCase: UpdateRecipeUseCase;
  deleteRecipeUseCase: DeleteRecipeUseCase;
  // WHY: owner-mutation flows must keep the public feed and detail cache in
  // sync. Without this, the recipe list at /recipes and the detail page show
  // stale data after an edit until the next full reload.
  recipeListStore: RecipeListStore;
  recipeDetailStore: RecipeDetailStore;
}
