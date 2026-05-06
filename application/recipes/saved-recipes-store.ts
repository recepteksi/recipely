import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';

export interface SavedRecipesStoreState {
  savedIds: ReadonlySet<string>;
  isLoading: boolean;
  error: Failure | null;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  addLocal: (id: string) => void;
  removeLocal: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Failure | null) => void;
  clearError: () => void;
}

export type SavedRecipesStore = UseBoundStore<StoreApi<SavedRecipesStoreState>>;

export const configureSavedRecipesStore = (): SavedRecipesStore => {
  return create<SavedRecipesStoreState>((set, get) => ({
    savedIds: new Set<string>(),
    isLoading: false,
    error: null,
    has: (id) => get().savedIds.has(id),
    toggle: (id) =>
      set((s) => {
        const next = new Set(s.savedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { savedIds: next };
      }),
    addLocal: (id) =>
      set((s) => {
        if (s.savedIds.has(id)) return s;
        const next = new Set(s.savedIds);
        next.add(id);
        return { savedIds: next };
      }),
    removeLocal: (id) =>
      set((s) => {
        if (!s.savedIds.has(id)) return s;
        const next = new Set(s.savedIds);
        next.delete(id);
        return { savedIds: next };
      }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }));
};
