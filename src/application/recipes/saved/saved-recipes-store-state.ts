import type { Failure } from '@core/failure';

export interface SavedRecipesStoreState {
  savedIds: ReadonlySet<string>;
  isLoading: boolean;
  error: Failure | null;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  addLocal: (id: string) => void;
  removeLocal: (id: string) => void;
  setSavedIds: (ids: Set<string>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Failure | null) => void;
  clearError: () => void;
}
