import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t, getLocale } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';
import type { CreateRecipeInput } from '@domain/recipes/create-recipe-input';
import type { RecipeMediaUpload } from '@domain/recipes/recipe-media-upload';
import type { UpdateRecipeInput } from '@domain/recipes/update-recipe-input';
import { Difficulty } from '@domain/recipes/difficulty';
import { CuisineKey } from '@domain/recipes/cuisine-key';
import type { EditableRecipe } from '@presentation/screens/create-recipe/editable-recipe';
import {
  editableHasContent,
  editableToSnapshot,
  emptyEditable,
  recipeToEditable,
  snapshotToEditable,
} from '@presentation/screens/create-recipe/recipe-mapping';
import { showErrorToast, showToast } from '@presentation/base/feedback/show-toast';
import { useDraftAutosave } from '@presentation/screens/create-recipe/use-draft-autosave';
import { PromptPhase } from '@presentation/screens/create-recipe/prompt-phase';
import { GeneratingView } from '@presentation/screens/create-recipe/generating-view';
import { RecipePreviewEditor } from '@presentation/screens/create-recipe/recipe-preview-editor';
import { RefineDock } from '@presentation/screens/create-recipe/refine-dock';
import { PhotosSheet } from '@presentation/screens/create-recipe/photos-sheet';
import { ExitSheet } from '@presentation/screens/create-recipe/exit-sheet';
import type { ChatMessage } from '@domain/drafts/chat-message';
import type { Phase } from '@presentation/screens/create-recipe/phase';
import { ValidationFailure, type Failure } from '@core/failure';
import {
  mapFieldErrorsToInputs,
  NO_CREATE_RECIPE_FIELD_ERRORS,
} from '@presentation/screens/create-recipe/map-field-errors-to-inputs';
import type { CreateRecipeFieldErrors } from '@presentation/screens/create-recipe/create-recipe-field-errors';
import type { CreateRecipeFieldKey } from '@presentation/screens/create-recipe/create-recipe-field-key';

const GEN_STEP_COUNT = 5;
const GEN_STEP_INTERVAL_MS = 620;

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Medium]: 'Medium',
  [Difficulty.Hard]: 'Hard',
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

/**
 * Converts a gallery `MediaItem` into a `RecipeMediaUpload`. The filename is
 * unique per call so multiple photos never collide in the multipart payload.
 */
const toMediaUpload = (item: MediaItem): RecipeMediaUpload => {
  const ext = item.url.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ext.length > 0 && ext.length <= 4 ? ext : 'jpg';
  return {
    uri: item.url,
    fileName: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`,
    mimeType: MIME_BY_EXT[safeExt] ?? 'image/jpeg',
    type: item.type,
  };
};

export const CreateRecipeScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();
  const { createdRecipesStore, draftsStore } = useStores();

  const createState = createdRecipesStore((s) => s.createState);
  const updateState = createdRecipesStore((s) => s.updateState);
  const refineState = createdRecipesStore((s) => s.refineState);
  const latestDraft = draftsStore((s) => s.latestDraft);
  const loadLatestDraft = draftsStore((s) => s.loadLatestDraft);
  const upsertDraft = draftsStore((s) => s.upsertDraft);

  const params = useLocalSearchParams<{
    recipeId?: string;
    draftId?: string;
    importUrl?: string;
  }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : undefined;
  const draftId = typeof params.draftId === 'string' ? params.draftId : undefined;
  const importUrl = typeof params.importUrl === 'string' ? params.importUrl : undefined;
  const isEditMode = recipeId !== undefined && recipeId.length > 0;

  const existingRecipe = isEditMode
    ? createdRecipesStore((s) => s.findById)(recipeId)
    : undefined;

  // A stable draft id for the lifetime of a NEW draft. A real UUID is required
  // by the backend; resumed drafts reuse their own id.
  const newDraftId = useRef(Crypto.randomUUID()).current;
  const activeDraftId = draftId ?? newDraftId;

  const [phase, setPhase] = useState<Phase>(isEditMode ? 'preview' : 'prompt');
  const [importing, setImporting] = useState(false);
  const [recipe, setRecipe] = useState<EditableRecipe>(() =>
    isEditMode && existingRecipe !== undefined
      ? recipeToEditable(existingRecipe, [...existingRecipe.media])
      : emptyEditable(),
  );
  const [prompt, setPrompt] = useState('');
  const originalPrompt = useRef('');
  const [genStep, setGenStep] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CreateRecipeFieldErrors>(NO_CREATE_RECIPE_FIELD_ERRORS);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const refining = refineState.status === 'refining';
  const isSaving = isEditMode
    ? updateState.status === 'updating'
    : createState.status === 'creating';

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
  }, [draftId, draftsStore]);

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

  // Auto-save the working draft (not when editing a published recipe).
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
      // Error: drop back to prompt with an assistant error note for context.
      setChatHistory([{ role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      createdRecipesStore.getState().resetGenerateState();
      setPhase('prompt');
    },
    [createdRecipesStore],
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
      // Error: drop back to prompt and surface the failure, with an assistant note.
      if (state.status === 'error') showErrorToast(state.failure);
      setChatHistory([{ role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      createdRecipesStore.getState().resetImportState();
      setImporting(false);
      setPhase('prompt');
    },
    [createdRecipesStore],
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
      const snapshot = editableToSnapshot(recipe);
      const result = await createdRecipesStore.getState().refineRecipe(snapshot, trimmed);
      if (result !== null) {
        setRecipe((prev) => recipeToEditable(result, prev.media));
        setChatHistory((h) => [...h, { role: 'assistant', content: t().createRecipe.aiUpdated }]);
      } else {
        setChatHistory((h) => [...h, { role: 'assistant', content: t().createRecipe.aiError, error: true }]);
      }
      createdRecipesStore.getState().resetRefineState();
    },
    [createdRecipesStore, recipe, refining],
  );

  const startBlank = useCallback((): void => {
    setRecipe(emptyEditable());
    setChatHistory([]);
    originalPrompt.current = '';
    setPhase('preview');
  }, []);

  const resumeLatestDraft = useCallback((): void => {
    if (latestDraft === null) return;
    router.replace({ pathname: '/create-recipe', params: { draftId: latestDraft.id } });
  }, [latestDraft, router]);

  // Clears a single field's inline validation error once the user edits it,
  // leaving any other still-invalid fields highlighted.
  const clearFieldError = useCallback((key: CreateRecipeFieldKey): void => {
    setFieldErrors((prev) => {
      if (prev.fields[key] === undefined) return prev;
      const nextFields: CreateRecipeFieldErrors['fields'] = { ...prev.fields };
      delete nextFields[key];
      return { ...prev, fields: nextFields };
    });
  }, []);

  // WHY: a `ValidationFailure` carries a per-field breakdown (`fieldErrors`) the
  // generic toast never surfaced — nothing on the form was ever highlighted, so
  // "Check the highlighted fields" pointed at nothing. This binds each entry to
  // its matching input (red border + inline message) in addition to the toast;
  // entries this screen has no input for still reach the user via a toast
  // instead of being silently dropped.
  const surfaceSaveFailure = useCallback((failure: Failure): void => {
    showErrorToast(failure);
    if (!(failure instanceof ValidationFailure)) {
      setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
      return;
    }
    const parsed = mapFieldErrorsToInputs(failure.fieldErrors);
    setFieldErrors(parsed);
    if (parsed.unmatched.length > 0) {
      showToast({ severity: 'danger', message: parsed.unmatched.join(' ') });
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof EditableRecipe>(key: K, value: EditableRecipe[K]): void => {
      setRecipe((r) => ({ ...r, [key]: value }));
      if (key !== 'media') clearFieldError(key as CreateRecipeFieldKey);
    },
    [clearFieldError],
  );

  const changeIngredient = useCallback(
    (i: number, value: string): void => {
      setRecipe((r) => ({ ...r, ingredients: r.ingredients.map((x, idx) => (idx === i ? value : x)) }));
      clearFieldError('ingredients');
    },
    [clearFieldError],
  );
  const removeIngredient = useCallback(
    (i: number): void => {
      setRecipe((r) => ({
        ...r,
        ingredients: r.ingredients.length <= 1 ? [''] : r.ingredients.filter((_, idx) => idx !== i),
      }));
      clearFieldError('ingredients');
    },
    [clearFieldError],
  );
  const addIngredient = useCallback((): void => {
    setRecipe((r) => ({ ...r, ingredients: [...r.ingredients, ''] }));
    clearFieldError('ingredients');
  }, [clearFieldError]);
  const changeStep = useCallback(
    (i: number, value: string): void => {
      setRecipe((r) => ({ ...r, instructions: r.instructions.map((x, idx) => (idx === i ? value : x)) }));
      clearFieldError('instructions');
    },
    [clearFieldError],
  );
  const removeStep = useCallback(
    (i: number): void => {
      setRecipe((r) => ({
        ...r,
        instructions: r.instructions.length <= 1 ? [''] : r.instructions.filter((_, idx) => idx !== i),
      }));
      clearFieldError('instructions');
    },
    [clearFieldError],
  );
  const addStep = useCallback((): void => {
    setRecipe((r) => ({ ...r, instructions: [...r.instructions, ''] }));
    clearFieldError('instructions');
  }, [clearFieldError]);

  const addMedia = useCallback(
    (items: MediaItem[]): void => setRecipe((r) => ({ ...r, media: [...r.media, ...items] })),
    [],
  );
  const removeMedia = useCallback(
    (i: number): void => setRecipe((r) => ({ ...r, media: r.media.filter((_, idx) => idx !== i) })),
    [],
  );
  const setCover = useCallback((i: number): void => {
    setRecipe((r) => {
      const arr = [...r.media];
      const [picked] = arr.splice(i, 1);
      if (picked === undefined) return r;
      return { ...r, media: [picked, ...arr] };
    });
  }, []);

  const handlePublish = useCallback(async (): Promise<void> => {
    const cleanIngredients = recipe.ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
    if (recipe.name.trim().length === 0 || cleanIngredients.length === 0) {
      setMissingMessage(t().createRecipe.missing);
      return;
    }
    const images = recipe.media.filter((m) => m.type === 'image');
    // WHY: the backend create endpoint requires a cover image URL (the /recipes
    // schema marks `image` as a required URL), so a recipe cannot be published
    // without at least one photo. Edit mode keeps the existing cover, so this
    // guard only applies to create.
    if (images.length === 0) {
      setMissingMessage(t().createRecipe.noImage);
      return;
    }
    setMissingMessage(null);
    setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
    const locale = getLocale();
    const cleanInstructions = recipe.instructions.map((s) => s.trim()).filter((s) => s.length > 0);
    const input: CreateRecipeInput = {
      name: { [locale]: recipe.name.trim() },
      cuisine: recipe.cuisine ?? CuisineKey.Other,
      category: recipe.category,
      difficulty: recipe.difficulty,
      ingredients: { [locale]: cleanIngredients },
      instructions: { [locale]: cleanInstructions },
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      media: images.map(toMediaUpload),
      tags: { [locale]: [DIFFICULTY_LABELS[recipe.difficulty]] },
      mealType: { [locale]: [] },
      isPublished: true,
      locale,
    };
    await createdRecipesStore.getState().createRecipe(input);
    const state = createdRecipesStore.getState().createState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetCreateState();
      createdRecipesStore.getState().clearAiDraft();
      // WHY: best-effort cleanup of the working draft now that it's published.
      // A failure here is intentionally swallowed (not toasted): the publish
      // already succeeded, and a leftover draft is self-healing — it just stays
      // re-deletable in My Recipes rather than blocking the success path.
      await draftsStore.getState().deleteDraft(activeDraftId);
      router.replace('/my-recipes');
      return;
    }
    // WHY: publish previously failed silently — the spinner stopped and the only
    // trace was a console 4xx. Surface it as a toast so the user always gets a
    // reaction, then reset so the button is tappable again.
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure);
      createdRecipesStore.getState().resetCreateState();
    }
  }, [recipe, createdRecipesStore, draftsStore, activeDraftId, router, surfaceSaveFailure]);

  const handleUpdate = useCallback(async (): Promise<void> => {
    if (recipeId === undefined) return;
    const cleanIngredients = recipe.ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
    if (recipe.name.trim().length === 0 || cleanIngredients.length === 0) {
      setMissingMessage(t().createRecipe.missing);
      return;
    }
    setMissingMessage(null);
    setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
    const locale = getLocale();
    const cleanInstructions = recipe.instructions.map((s) => s.trim()).filter((s) => s.length > 0);
    const images = recipe.media.filter((m) => m.type === 'image');
    const input: UpdateRecipeInput = {
      name: { [locale]: recipe.name.trim() },
      cuisine: recipe.cuisine ?? CuisineKey.Other,
      category: recipe.category,
      difficulty: recipe.difficulty,
      ingredients: { [locale]: cleanIngredients },
      instructions: { [locale]: cleanInstructions },
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      ...(images.length > 0 ? { media: images.map(toMediaUpload) } : {}),
      tags: { [locale]: [DIFFICULTY_LABELS[recipe.difficulty]] },
      mealType: { [locale]: [] },
      isPublished: true,
      locale,
    };
    await createdRecipesStore.getState().updateRecipe(recipeId, input);
    const state = createdRecipesStore.getState().updateState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetUpdateState();
      router.back();
      return;
    }
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure);
      createdRecipesStore.getState().resetUpdateState();
    }
  }, [recipe, recipeId, createdRecipesStore, router, surfaceSaveFailure]);

  const handleSave = useCallback((): void => {
    if (isEditMode) void handleUpdate();
    else void handlePublish();
  }, [isEditMode, handleUpdate, handlePublish]);

  const attemptClose = useCallback((): void => {
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
    // WHY: best-effort — if the delete fails the draft simply remains in My
    // Recipes (re-deletable there). We don't block or toast on the way out, so
    // "discard" always lets the user leave.
    await draftsStore.getState().deleteDraft(activeDraftId);
    setExitOpen(false);
    router.back();
  }, [draftsStore, activeDraftId, router]);

  const headerTitle = useMemo(
    () => (isEditMode ? t().createRecipe.editorTitle : t().createRecipe.previewTitle),
    [isEditMode],
  );

  if (phase === 'prompt') {
    return (
      <KeyboardAvoider style={styles.root}>
        <ResponsiveContainer route="createRecipe" gutter={false} fill>
          <PromptPhase
            insets={insets}
            prompt={prompt}
            onChangePrompt={setPrompt}
            onAppendChip={(chip) =>
              setPrompt((p) => (p.trim().length === 0 ? chip : `${p}, ${chip.toLowerCase()}`))
            }
            onGenerate={() => void runGenerate(prompt)}
            onStartBlank={startBlank}
            onClose={attemptClose}
            latestDraft={latestDraft}
            onResumeDraft={resumeLatestDraft}
          />
        </ResponsiveContainer>
      </KeyboardAvoider>
    );
  }

  if (phase === 'generating') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ResponsiveContainer route="createRecipe" gutter={false} fill>
          <GeneratingView activeStep={genStep} variant={importing ? 'import' : 'generate'} />
        </ResponsiveContainer>
      </View>
    );
  }

  return (
    <KeyboardAvoider style={[styles.root, { backgroundColor: colors.background }]}>
      <ResponsiveContainer route="createRecipe" gutter={false} fill>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              paddingTop: isWebShell ? spacing.md : insets.top + spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={attemptClose}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.cancel}
          >
            <Ionicons name="close" size={sizes.iconXxs} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText variant="subtitle" style={styles.headerTitle}>
              {headerTitle}
            </ThemedText>
            {!isEditMode ? (
              <View style={[styles.aiBadge, { backgroundColor: colors.chipBackground }]}>
                <Ionicons name="sparkles" size={fontSizes.micro} color={colors.primary} />
                <ThemedText variant="caption" style={[styles.aiBadgeLabel, { color: colors.primary }]}>
                  {t().createRecipe.aiBadge}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveBtn, shadows.sm, { opacity: isSaving ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.save}
          >
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveInner}
            >
              <ThemedText variant="caption" style={[styles.saveLabel, { color: colors.primaryText }]}>
                {isEditMode
                  ? updateState.status === 'updating'
                    ? t().createRecipe.updating
                    : t().createRecipe.updateSave
                  : createState.status === 'creating'
                    ? t().createRecipe.publishing
                    : t().createRecipe.save}
              </ThemedText>
            </LinearGradient>
          </Pressable>
        </View>

        {refining ? (
          <View style={[styles.refiningTrack, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.refiningFill}
            />
          </View>
        ) : null}

        <View style={styles.content}>
          <RecipePreviewEditor
            recipe={recipe}
            missingMessage={missingMessage}
            fieldErrors={fieldErrors.fields}
            onChangeName={(v) => updateField('name', v)}
            onChangeCuisine={(v) => updateField('cuisine', v)}
            onChangeCategory={(v) => updateField('category', v)}
            onChangeServings={(v) => updateField('servings', v)}
            onChangeDifficulty={(v) => updateField('difficulty', v)}
            onChangePrep={(v) => updateField('prepTimeMinutes', v)}
            onChangeCook={(v) => updateField('cookTimeMinutes', v)}
            onChangeIngredient={changeIngredient}
            onRemoveIngredient={removeIngredient}
            onAddIngredient={addIngredient}
            onChangeStep={changeStep}
            onRemoveStep={removeStep}
            onAddStep={addStep}
            onOpenPhotos={() => setPhotosOpen(true)}
          />
        </View>

        {chatExpanded ? (
          // Dim the editor behind the expanded assistant transcript so the
          // conversation reads against a solid backdrop; tapping it collapses
          // the assistant (same pattern as the sheet backdrops).
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
            onPress={() => setChatExpanded(false)}
          />
        ) : null}
        <RefineDock
          chatHistory={chatHistory}
          chatInput={chatInput}
          onChangeChatInput={setChatInput}
          expanded={chatExpanded}
          onExpand={() => setChatExpanded(true)}
          onCollapse={() => setChatExpanded(false)}
          refining={refining}
          canRegenerate={originalPrompt.current.length > 0}
          onRegenerate={() => void runGenerate(originalPrompt.current)}
          onSubmit={(instruction) => void handleRefine(instruction)}
          bottomInset={isWebShell ? 0 : insets.bottom}
        />
      </ResponsiveContainer>

      <PhotosSheet
        visible={photosOpen}
        media={recipe.media}
        onAdd={addMedia}
        onRemove={removeMedia}
        onSetCover={setCover}
        onClose={() => setPhotosOpen(false)}
      />
      <ExitSheet
        visible={exitOpen}
        onSaveDraft={() => void onSaveDraftAndExit()}
        onDiscard={() => void onDiscardAndExit()}
        onKeepEditing={() => setExitOpen(false)}
      />
    </KeyboardAvoider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
  },
  headerTitle: {
    fontSize: fontSizes.heading,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.round,
  },
  aiBadgeLabel: {
    fontWeight: '700',
    fontSize: fontSizes.micro,
  },
  saveBtn: {
    height: sizes.iconBtn,
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  saveInner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontWeight: '700',
    fontSize: fontSizes.caption,
  },
  refiningTrack: {
    height: 3,
    overflow: 'hidden',
  },
  refiningFill: {
    height: 3,
    width: '40%',
  },
  content: {
    flex: 1,
  },
});
