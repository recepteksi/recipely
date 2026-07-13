import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { getLocale, t } from '@presentation/i18n';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import { useDraftAutosave } from '@presentation/app/create-recipe/hooks/use-draft-autosave';
import {
  editableHasContent,
  editableToSnapshot,
  emptyEditable,
  recipeToEditable,
  snapshotToEditable,
} from '@presentation/app/create-recipe/model/recipe-mapping';
import type { ChatMessage } from '@domain/drafts/chat-message';
import type { Phase } from '@presentation/app/create-recipe/model/phase';
import type { UseRecipeGenerationArgs } from '@presentation/app/create-recipe/model/use-recipe-generation-args';

const GEN_STEP_COUNT = 5;
const GEN_STEP_INTERVAL_MS = 620;

/**
 * Drives the AI phase flow of the create screen: prompt → generating → preview,
 * the generate/import/refine calls, the generating-checklist ticker, draft
 * resume + autosave, and the exit-with-unsaved-work flow.
 */
export const useRecipeGeneration = ({
  recipe,
  setRecipe,
  isEditMode,
  activeDraftId,
  draftId,
  importUrl,
}: UseRecipeGenerationArgs) => {
  const router = useRouter();
  const { createdRecipesStore, draftsStore } = useStores();
  const refineState = createdRecipesStore((s) => s.refineState);
  const latestDraft = draftsStore((s) => s.latestDraft);
  const loadLatestDraft = draftsStore((s) => s.loadLatestDraft);
  const upsertDraft = draftsStore((s) => s.upsertDraft);

  const [phase, setPhase] = useState<Phase>(isEditMode ? 'preview' : 'prompt');
  const [importing, setImporting] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const originalPrompt = useRef('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const refining = refineState.status === 'refining';

  // Resume a draft passed via ?draftId once on mount.
  useEffect(() => {
    if (draftId === undefined) return;
    let cancelled = false;
    void (async () => {
      const loaded = await draftsStore.getState().getDraft(draftId);
      if (cancelled || loaded === null) return;
      setRecipe(snapshotToEditable(loaded.snapshot));
      setChatHistory([...loaded.chatHistory]);
      originalPrompt.current = loaded.prompt;
      setPrompt(loaded.prompt);
      setPhase('preview');
    })();
    return () => {
      cancelled = true;
    };
  }, [draftId, draftsStore, setRecipe]);

  // Surface a "Resume your draft" card on a fresh prompt phase.
  useEffect(() => {
    if (!isEditMode && draftId === undefined) void loadLatestDraft();
  }, [isEditMode, draftId, loadLatestDraft]);

  // Drive the generating checklist while the backend works.
  useEffect(() => {
    if (phase !== 'generating') return;
    setGenStep(0);
    const id = setInterval(() => {
      setGenStep((s) => Math.min(GEN_STEP_COUNT - 1, s + 1));
    }, GEN_STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase]);

  useDraftAutosave({
    enabled: !isEditMode && phase === 'preview',
    draftId: activeDraftId,
    prompt: originalPrompt.current,
    recipe,
    chatHistory,
    upsertDraft,
  });

  const runGenerate = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      originalPrompt.current = trimmed;
      setPhase('generating');
      await createdRecipesStore.getState().generateRecipe(trimmed, getLocale());
      const state = createdRecipesStore.getState().generateState;
      if (state.status === 'success') {
        setRecipe((prev) => recipeToEditable(state.recipe, prev.media));
        setChatHistory([
          { role: 'user', content: trimmed },
          { role: 'assistant', content: t().createRecipe.aiFirstReply },
        ]);
        createdRecipesStore.getState().resetGenerateState();
        setPhase('preview');
        return;
      }
      setChatHistory([{ role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      createdRecipesStore.getState().resetGenerateState();
      setPhase('prompt');
    },
    [createdRecipesStore, setRecipe],
  );

  const runImport = useCallback(
    async (url: string): Promise<void> => {
      const trimmed = url.trim();
      if (trimmed.length === 0) return;
      setImporting(true);
      setPhase('generating');
      await createdRecipesStore.getState().importInstagram(trimmed, getLocale());
      const state = createdRecipesStore.getState().importState;
      if (state.status === 'success') {
        setRecipe((prev) => recipeToEditable(state.recipe, prev.media));
        setChatHistory([{ role: 'assistant', content: t().createRecipe.importFirstReply }]);
        createdRecipesStore.getState().resetImportState();
        setImporting(false);
        setPhase('preview');
        return;
      }
      if (state.status === 'error') showErrorToast(state.failure);
      setChatHistory([{ role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      createdRecipesStore.getState().resetImportState();
      setImporting(false);
      setPhase('prompt');
    },
    [createdRecipesStore, setRecipe],
  );

  // Kick off an Instagram import once when arriving via a share intent.
  const importHandledRef = useRef(false);
  useEffect(() => {
    if (isEditMode || importUrl === undefined || importHandledRef.current) return;
    importHandledRef.current = true;
    void runImport(importUrl);
  }, [isEditMode, importUrl, runImport]);

  const handleRefine = useCallback(
    async (instruction: string): Promise<void> => {
      const trimmed = instruction.trim();
      if (trimmed.length === 0 || refining) return;
      setChatInput('');
      setChatExpanded(true);
      setChatHistory((h) => [...h, { role: 'user', content: trimmed }]);
      const result = await createdRecipesStore.getState().refineRecipe(editableToSnapshot(recipe), trimmed);
      if (result !== null) {
        setRecipe((prev) => recipeToEditable(result, prev.media));
        setChatHistory((h) => [...h, { role: 'assistant', content: t().createRecipe.aiUpdated }]);
      } else {
        setChatHistory((h) => [...h, { role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      }
      createdRecipesStore.getState().resetRefineState();
    },
    [createdRecipesStore, recipe, refining, setRecipe],
  );

  const onStartBlank = useCallback((): void => {
    setRecipe(emptyEditable());
    setChatHistory([]);
    originalPrompt.current = '';
    setPhase('preview');
  }, [setRecipe]);

  const onResumeDraft = useCallback((): void => {
    if (latestDraft === null) return;
    router.replace({ pathname: '/create-recipe', params: { draftId: latestDraft.id } });
  }, [latestDraft, router]);

  const onClose = useCallback((): void => {
    if (isEditMode) {
      router.back();
      return;
    }
    if (phase === 'preview' && editableHasContent(recipe)) {
      setExitOpen(true);
      return;
    }
    router.back();
  }, [isEditMode, phase, recipe, router]);

  const onSaveDraftAndExit = useCallback(async (): Promise<void> => {
    await upsertDraft({
      id: activeDraftId,
      prompt: originalPrompt.current,
      snapshot: editableToSnapshot(recipe),
      chatHistory,
    });
    setExitOpen(false);
    router.back();
  }, [upsertDraft, activeDraftId, recipe, chatHistory, router]);

  const onDiscardAndExit = useCallback(async (): Promise<void> => {
    // Best-effort: if the delete fails the draft simply remains in My Recipes.
    await draftsStore.getState().deleteDraft(activeDraftId);
    setExitOpen(false);
    router.back();
  }, [draftsStore, activeDraftId, router]);

  return {
    phase,
    importing,
    genStep,
    refining,
    prompt,
    onChangePrompt: setPrompt,
    onAppendChip: (chip: string) =>
      setPrompt((p) => (p.trim().length === 0 ? chip : `${p}, ${chip.toLowerCase()}`)),
    onGenerate: () => void runGenerate(prompt),
    onStartBlank,
    onClose,
    latestDraft,
    onResumeDraft,
    chatHistory,
    chatInput,
    onChangeChatInput: setChatInput,
    chatExpanded,
    onExpandChat: () => setChatExpanded(true),
    onCollapseChat: () => setChatExpanded(false),
    canRegenerate: originalPrompt.current.length > 0,
    onRegenerate: () => void runGenerate(originalPrompt.current),
    onSubmitRefine: (instruction: string) => void handleRefine(instruction),
    exitOpen,
    onSaveDraftAndExit: () => void onSaveDraftAndExit(),
    onDiscardAndExit: () => void onDiscardAndExit(),
    onKeepEditing: () => setExitOpen(false),
  };
};
