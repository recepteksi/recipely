import { Recipe } from '@domain/recipes/recipe';

const validProps = {
  id: 'r1',
  name: 'Margherita Pizza',
  cuisine: 'Italian',
  difficulty: 'Easy',
  ingredients: ['Flour', 'Tomato', 'Mozzarella'],
  instructions: ['Make dough', 'Add toppings', 'Bake'],
  prepTimeMinutes: 20,
  cookTimeMinutes: 15,
  image: 'https://cdn.dummyjson.com/recipe-images/1.webp',
  rating: 4.6,
  tags: ['Pizza', 'Italian'],
  mealType: ['Dinner'],
  ownerId: 'o1',
};

describe('Recipe.create', () => {
  it('accepts valid props', () => {
    const r = Recipe.create(validProps);

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.id).toBe('r1');
      expect(r.value.name).toBe('Margherita Pizza');
      expect(r.value.cuisine).toBe('Italian');
      expect(r.value.difficulty).toBe('Easy');
      expect(r.value.ingredients).toEqual(['Flour', 'Tomato', 'Mozzarella']);
    }
  });

  it.each([
    ['id', { ...validProps, id: ' ' }],
    ['name', { ...validProps, name: '' }],
  ])('rejects blank %s', (field, props) => {
    const r = Recipe.create(props);

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure.field).toBe(field);
  });

  it('entity equality is id-based', () => {
    const a = Recipe.create(validProps);
    const b = Recipe.create({ ...validProps, name: 'Different' });

    if (a.ok && b.ok) expect(a.value.equals(b.value)).toBe(true);
  });
});
