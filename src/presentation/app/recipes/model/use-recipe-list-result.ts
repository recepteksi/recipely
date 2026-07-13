import type { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import type { UiFilters } from '@presentation/app/recipes/model/ui-filters';
import type { SortKey } from '@presentation/app/recipes/model/sort-key';
import type { RecipeListState } from '@application/recipes/recipe-list-state';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { Difficulty } from '@domain/recipes/difficulty';

/** View model returned by {@link useRecipeList} for the recipe-list screen. */
export interface UseRecipeListResult {
  state: RecipeListState;
  filteredRecipes: RecipeSummary[];
  isWebShell: boolean;
  isSearching: boolean;
  activeFilterCount: number;
  gridColumns: number;
  sortBy: SortKey;
  filters: UiFilters;
  activeCuisineLabel: string | null;
  unreadCount: number;

  // Mobile collapsing-header scroll state.
  scrollY: SharedValue<number>;
  headerTranslateY: SharedValue<number>;
  reduceMotion: boolean;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;

  // Search (mobile local search field).
  search: string;
  onSearchChange: (value: string) => void;

  // Navigation + list actions.
  onRefresh: () => void;
  onOpenRecipe: (id: string) => void;
  onOpenCreate: () => void;
  onNotifications: () => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onChangeSort: (key: SortKey) => void;

  // Applied-filter quick actions (web grid + mobile chips).
  onToggleCuisineQuick: (cuisine: string) => void;
  onDifficultyChange: (difficulty: Difficulty | null) => void;
  onRemoveCategory: (category: string) => void;
  onRemoveDifficulty: (difficulty: Difficulty) => void;
  onRemoveMaxTime: () => void;
  onResetFilters: () => void;

  // Filter sheet / modal state + pending edits.
  sheetOpen: 'filter' | null;
  pendingFilters: UiFilters;
  pendingSort: SortKey;
  onOpenFilter: () => void;
  onCloseSheet: () => void;
  onSelectPendingSort: (key: SortKey) => void;
  onTogglePendingCuisine: (cuisine: string) => void;
  onTogglePendingCategory: (category: string) => void;
  onTogglePendingDifficulty: (difficulty: Difficulty) => void;
  onSetPendingMaxTime: (minutes: number) => void;
  onApplyFilters: () => void;

  // Guest sign-in prompt.
  promptVisible: boolean;
  promptMessage: string | undefined;
  onClosePrompt: () => void;
  onGoToSignIn: () => void;
}
