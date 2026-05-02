import { create, type StoreApi, type UseBoundStore } from 'zustand';

export interface SavedRecipesStoreState {
  savedIds: ReadonlySet<string>;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
}

export type SavedRecipesStore = UseBoundStore<StoreApi<SavedRecipesStoreState>>;

export const configureSavedRecipesStore = (): SavedRecipesStore => {
  return create<SavedRecipesStoreState>((set, get) => ({
    savedIds: new Set<string>(),
    has: (id) => get().savedIds.has(id),
    toggle: (id) =>
      set((s) => {
        const next = new Set(s.savedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { savedIds: next };
      }),
    add: (id) =>
      set((s) => {
        if (s.savedIds.has(id)) return s;
        const next = new Set(s.savedIds);
        next.add(id);
        return { savedIds: next };
      }),
    remove: (id) =>
      set((s) => {
        if (!s.savedIds.has(id)) return s;
        const next = new Set(s.savedIds);
        next.delete(id);
        return { savedIds: next };
      }),
  }));
};
