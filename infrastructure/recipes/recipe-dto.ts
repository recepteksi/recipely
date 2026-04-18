export interface RecipeDto {
  id: number;
  name: string;
  cuisine: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  image: string;
  rating: number;
  tags: string[];
  userId: number;
  mealType: string[];
}
