import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { ChatMessage } from '@domain/drafts/chat-message';
import type { ListDraftsUseCase } from '@application/drafts/list-drafts-use-case';
import type { GetLatestDraftUseCase } from '@application/drafts/get-latest-draft-use-case';
import type { GetDraftUseCase } from '@application/drafts/get-draft-use-case';
import type { UpsertDraftUseCase } from '@application/drafts/upsert-draft-use-case';
import type { DeleteDraftUseCase } from '@application/drafts/delete-draft-use-case';
import { DRAFTS_PAGE_SIZE } from '@infrastructure/constants/api';

export type DraftsListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded' }
  | { status: 'error'; failure: Failure };

export interface UpsertDraftStoreInput {
  id: string;
  prompt: string;
  snapshot: DraftRecipeSnapshot;
  chatHistory: ChatMessage[];
}

export interface DraftsStoreState {
  drafts: readonly RecipeDraft[];
  listState: DraftsListState;
  latestDraft: RecipeDraft | null;
  loadDrafts: () => Promise<void>;
  loadLatestDraft: () => Promise<void>;
  upsertDraft: (input: UpsertDraftStoreInput) => Promise<RecipeDraft | null>;
  deleteDraft: (id: string) => Promise<Result<void, Failure>>;
  getDraft: (id: string) => Promise<RecipeDraft | null>;
}

export interface DraftsStoreDeps {
  listDraftsUseCase: ListDraftsUseCase;
  getLatestDraftUseCase: GetLatestDraftUseCase;
  getDraftUseCase: GetDraftUseCase;
  upsertDraftUseCase: UpsertDraftUseCase;
  deleteDraftUseCase: DeleteDraftUseCase;
}

export type DraftsStore = UseBoundStore<StoreApi<DraftsStoreState>>;

export const configureDraftsStore = (deps: DraftsStoreDeps): DraftsStore => {
  return create<DraftsStoreState>((set, get) => ({
    drafts: [],
    listState: { status: 'idle' },
    latestDraft: null,
    loadDrafts: async () => {
      set({ listState: { status: 'loading' } });
      const result = await deps.listDraftsUseCase.execute({
        page: 1,
        pageSize: DRAFTS_PAGE_SIZE,
      });
      if (!result.ok) {
        set({ listState: { status: 'error', failure: result.failure } });
        return;
      }
      set({ drafts: result.value.items, listState: { status: 'loaded' } });
    },
    loadLatestDraft: async () => {
      const result = await deps.getLatestDraftUseCase.execute();
      if (!result.ok) {
        return;
      }
      set({ latestDraft: result.value });
    },
    upsertDraft: async (input) => {
      const result = await deps.upsertDraftUseCase.execute(input);
      if (!result.ok) {
        return null;
      }
      const draft = result.value;
      // WHY: keep the local list and the "latest" pointer in sync so the AI
      // create flow reflects the just-saved draft without a full reload.
      set((s) => {
        const exists = s.drafts.some((d) => d.id === draft.id);
        const drafts = exists
          ? s.drafts.map((d) => (d.id === draft.id ? draft : d))
          : [draft, ...s.drafts];
        return { drafts, latestDraft: draft };
      });
      return draft;
    },
    deleteDraft: async (id) => {
      const result = await deps.deleteDraftUseCase.execute(id);
      if (!result.ok) {
        return result;
      }
      set((s) => ({
        drafts: s.drafts.filter((d) => d.id !== id),
        latestDraft: s.latestDraft?.id === id ? null : s.latestDraft,
      }));
      return result;
    },
    getDraft: async (id) => {
      const result = await deps.getDraftUseCase.execute(id);
      if (!result.ok) {
        return null;
      }
      return result.value;
    },
  }));
};
