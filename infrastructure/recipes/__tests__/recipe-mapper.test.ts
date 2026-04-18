import { toRecipe } from '@infrastructure/recipes/recipe-mapper';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

const fullDto: RecipeDto = {
  id: 1,
  name: 'Classic Margherita Pizza',
  cuisine: 'Italian',
  difficulty: 'Easy',
  ingredients: ['Flour', 'Tomato', 'Mozzarella'],
  instructions: ['Make dough', 'Add toppings', 'Bake'],
  prepTimeMinutes: 20,
  cookTimeMinutes: 15,
  image: 'https://cdn.dummyjson.com/recipe-images/1.webp',
  rating: 4.6,
  tags: ['Pizza', 'Italian'],
  userId: 166,
  mealType: ['Dinner'],
};

describe('toRecipe', () => {
  it('maps a RecipeDto into a Recipe', () => {
    const r = toRecipe(fullDto);

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.id).toBe('1');
      expect(r.value.name).toBe('Classic Margherita Pizza');
      expect(r.value.cuisine).toBe('Italian');
      expect(r.value.difficulty).toBe('Easy');
      expect(r.value.ingredients).toEqual(['Flour', 'Tomato', 'Mozzarella']);
      expect(r.value.instructions).toEqual(['Make dough', 'Add toppings', 'Bake']);
      expect(r.value.prepTimeMinutes).toBe(20);
      expect(r.value.cookTimeMinutes).toBe(15);
      expect(r.value.rating).toBe(4.6);
      expect(r.value.ownerId).toBe('166');
    }
  });
});
