export type Token<T> = symbol & { readonly __type?: T };

export const TOKENS = {
  HttpClient: Symbol.for('HttpClient'),
  SecureStorage: Symbol.for('SecureStorage'),
  AuthRepository: Symbol.for('AuthRepository'),
  RecipeRepository: Symbol.for('RecipeRepository'),
  TaskRepository: Symbol.for('TaskRepository'),
} as const;
