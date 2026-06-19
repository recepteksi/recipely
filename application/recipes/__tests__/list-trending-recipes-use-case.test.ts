import { FakeRecipeRepository } from '@application/__fixtures__/fake-recipe-repository';
import { ListTrendingRecipesUseCase } from '@application/recipes/list-trending-recipes-use-case';
import { NetworkFailure } from '@core/failure';
import { fail, ok } from '@core/result/result';
import { Recipe } from '@domain/recipes/recipe';
import { CuisineKey } from '@domain/recipes/cuisine-key';
import { RecipeCategory } from '@domain/recipes/recipe-category';
import { Difficulty } from '@domain/recipes/difficulty';

const makeRecipe = (overrides: Partial<Parameters<typeof Recipe.create>[0]> = {}): Recipe => {
  const result = Recipe.create({
    id: 'r1',
    name: 'Stub Recipe',
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
    tags: ['quick'],
    mealType: ['Dinner'],
    ownerId: 'owner-1',
    likeCount: 0,
    likedByMe: false,
    viewCount: 0,
    ...overrides,
  });
  if (!result.ok) throw new Error('failed to build Recipe fixture');
  return result.value;
};

describe('ListTrendingRecipesUseCase.execute', () => {
  it('returns ok with the trending recipes from the repository', async () => {
    const recipes = [makeRecipe({ id: 'r1' }), makeRecipe({ id: 'r2' })];
    const repo = new FakeRecipeRepository({ listTrendingRecipesResult: ok(recipes) });
    const useCase = new ListTrendingRecipesUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(recipes);
  });

  it('passes the limit argument through to the repository', async () => {
    const recipes = [makeRecipe()];
    const repo = new FakeRecipeRepository({ listTrendingRecipesResult: ok(recipes) });
    const spy = jest.spyOn(repo, 'listTrendingRecipes');
    const useCase = new ListTrendingRecipesUseCase(repo);

    await useCase.execute(5);

    expect(spy).toHaveBeenCalledWith(5);
  });

  it('propagates failure from the repository', async () => {
    const failure = new NetworkFailure('offline');
    const repo = new FakeRecipeRepository({ listTrendingRecipesResult: fail(failure) });
    const useCase = new ListTrendingRecipesUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
