export const en = {
  common: {
    retry: 'Retry',
    loading: 'Loading...',
    error: 'Something went wrong',
    empty: 'Nothing here yet.',
  },
  login: {
    title: 'Recipely',
    subtitle: 'Sign in to view your recipes and tasks.',
    usernamePlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    signIn: 'Sign in',
    hint: 'Try: emilys / emilyspass',
    emptyFields: 'Please enter username and password.',
    invalidCredentials: 'Invalid username or password',
  },
  recipes: {
    title: 'Recipes',
    empty: 'No recipes found.',
    viewTasks: 'View tasks',
    cuisine: 'Cuisine',
    difficulty: 'Difficulty',
    prepTime: 'Prep time',
    cookTime: 'Cook time',
    rating: 'Rating',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    minutes: 'min',
  },
  tasks: {
    title: 'Tasks',
    empty: 'No tasks for this recipe.',
    completed: 'Completed',
    pending: 'Pending',
  },
  navigation: {
    recipes: 'Recipes',
    recipe: 'Recipe',
    tasks: 'Tasks',
    task: 'Task',
  },
};

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export type Translations = DeepStringify<typeof en>;
