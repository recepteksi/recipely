import { FakeRecipeRepository } from '@application/__fixtures__/fake-recipe-repository';
import { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import { UnknownFailure, ValidationFailure } from '@core/failure';
import { fail, ok } from '@core/result/result';
import { Recipe } from '@domain/recipes/recipe';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import { CuisineKey } from '@domain/recipes/cuisine-key';
import { RecipeCategory } from '@domain/recipes/recipe-category';
import { Difficulty } from '@domain/recipes/difficulty';

const snapshot: DraftRecipeSnapshot = {
  name: 'Spicy Pasta',
  ingredients: ['Pasta'],
  instructions: ['Boil'],
};

const makeRecipe = (): Recipe => {
  const result = Recipe.create({
    id: 'r1',
    name: 'Refined Recipe',
    cuisine: CuisineKey.Italian,
    category: RecipeCategory.Dinner,
    difficulty: Difficulty.Easy,
    ingredients: ['flour'],
    instructions: ['mix'],
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    caloriesPerServing: 0,
    image: 'https://cdn.example.com/r1.webp',
    media: [{ type: 'image', url: 'https://cdn.example.com/r1.webp' }],
    rating: 4.5,
    tags: [],
    mealType: [],
    ownerId: 'owner-1',
    likeCount: 0,
    likedByMe: false,
    viewCount: 0,
  });
  if (!result.ok) throw new Error('failed to build Recipe fixture');
  return result.value;
};

describe('RefineRecipeUseCase.execute', () => {
  it('returns the refined Recipe and forwards the trimmed instruction to the repo', async () => {
    const recipe = makeRecipe();
    const repo = new FakeRecipeRepository({ refineRecipeResult: ok(recipe) });
    const useCase = new RefineRecipeUseCase(repo);

    const r = await useCase.execute({ currentRecipe: snapshot, instruction: '  add garlic  ' });

    expect(repo.lastRefineCall).toEqual({ currentRecipe: snapshot, instruction: 'add garlic' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(recipe);
  });

  it('returns ValidationFailure createRecipe.aiError for an empty instruction without calling the repo', async () => {
    const repo = new FakeRecipeRepository();
    const useCase = new RefineRecipeUseCase(repo);

    const r = await useCase.execute({ currentRecipe: snapshot, instruction: '' });

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure).toBeInstanceOf(ValidationFailure);
      expect((r.failure as ValidationFailure).message).toBe('createRecipe.aiError');
    }
    expect(repo.refineCallCount).toBe(0);
  });

  it('returns ValidationFailure for a whitespace-only instruction without calling the repo', async () => {
    const repo = new FakeRecipeRepository();
    const useCase = new RefineRecipeUseCase(repo);

    const r = await useCase.execute({ currentRecipe: snapshot, instruction: '  \n\t ' });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBeInstanceOf(ValidationFailure);
    expect(repo.refineCallCount).toBe(0);
  });

  it('propagates a repository failure unchanged', async () => {
    const failure = new UnknownFailure('AI provider crashed');
    const repo = new FakeRecipeRepository({ refineRecipeResult: fail(failure) });
    const useCase = new RefineRecipeUseCase(repo);

    const r = await useCase.execute({ currentRecipe: snapshot, instruction: 'add garlic' });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
