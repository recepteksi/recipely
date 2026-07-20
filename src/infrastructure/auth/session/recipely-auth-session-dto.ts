import type { RecipelyUserDto } from '@infrastructure/auth/recipely-user-dto';

export interface RecipelyAuthSessionDto {
  token: string;
  user: RecipelyUserDto;
}
