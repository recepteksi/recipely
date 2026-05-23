export const RecipeCategory = {
  Breakfast: 'BREAKFAST',
  Lunch: 'LUNCH',
  Dinner: 'DINNER',
  Dessert: 'DESSERT',
  Snack: 'SNACK',
  Drink: 'DRINK',
  Soup: 'SOUP',
  Salad: 'SALAD',
  Appetizer: 'APPETIZER',
  SideDish: 'SIDE_DISH',
  MainCourse: 'MAIN_COURSE',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional enum-style value + type pairing
export type RecipeCategory = (typeof RecipeCategory)[keyof typeof RecipeCategory];

export const RECIPE_CATEGORY_VALUES: readonly RecipeCategory[] = [
  RecipeCategory.Breakfast,
  RecipeCategory.Lunch,
  RecipeCategory.Dinner,
  RecipeCategory.Dessert,
  RecipeCategory.Snack,
  RecipeCategory.Drink,
  RecipeCategory.Soup,
  RecipeCategory.Salad,
  RecipeCategory.Appetizer,
  RecipeCategory.SideDish,
  RecipeCategory.MainCourse,
];
