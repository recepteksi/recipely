import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { MediaPicker } from '@presentation/base/widgets/media-picker';
import { Slider } from '@presentation/base/widgets/slider';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { TimeSliderCard } from '@presentation/screens/create-recipe/time-slider-card';
import { ReviewRowItem } from '@presentation/screens/create-recipe/review-row-item';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes, type ThemeColors } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t, getLocale } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';
import type { Recipe } from '@domain/recipes/recipe';
import type { UpdateRecipeInput } from '@domain/recipes/i-recipe-repository';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { RECIPE_CATEGORY_VALUES, type RecipeCategory } from '@domain/recipes/recipe-category';
import { type Difficulty } from '@domain/recipes/difficulty';

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

const SERVINGS_MIN = 1;
const SERVINGS_MAX = 20;

const DIFFICULTIES: readonly Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

/** Formats a SCREAMING_SNAKE_CASE enum value to Title Case for display. */
const formatLabel = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

interface RecipeFormState {
  name: string;
  cuisine: CuisineKey | '';
  category: RecipeCategory | '';
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  media: MediaItem[];
}

const emptyForm: RecipeFormState = {
  name: '',
  cuisine: '',
  category: '',
  difficulty: 'EASY',
  prepTimeMinutes: 15,
  cookTimeMinutes: 20,
  servings: 4,
  ingredients: [''],
  instructions: [''],
  media: [],
};

// WHY: the backend draft Recipe already exposes locale-resolved strings via the
// mapper, so we just pull props straight off. We preserve the user's media
// (likely empty at this point in the flow) so they can still attach a cover.
const recipeToForm = (
  recipe: Recipe,
  prevMedia: MediaItem[],
): RecipeFormState => ({
  name: recipe.name,
  cuisine: recipe.cuisine,
  category: recipe.category,
  difficulty: recipe.difficulty,
  prepTimeMinutes: recipe.prepTimeMinutes > 0 ? recipe.prepTimeMinutes : emptyForm.prepTimeMinutes,
  cookTimeMinutes: recipe.cookTimeMinutes > 0 ? recipe.cookTimeMinutes : emptyForm.cookTimeMinutes,
  servings: recipe.servings > 0 ? recipe.servings : emptyForm.servings,
  ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [''],
  instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
  media: prevMedia,
});

const stepLabels = (): readonly string[] => [
  t().createRecipe.stepBasics,
  t().createRecipe.stepMedia,
  t().createRecipe.stepIngredients,
  t().createRecipe.stepInstructions,
  t().createRecipe.stepReview,
];

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const CreateRecipeScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();
  const { createdRecipesStore } = useStores();
  const createState = createdRecipesStore((s) => s.createState);
  const generateState = createdRecipesStore((s) => s.generateState);
  const updateState = createdRecipesStore((s) => s.updateState);
  const aiDraft = createdRecipesStore((s) => s.aiDraft);

  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const isEditMode = typeof recipeId === 'string' && recipeId.length > 0;
  const existingRecipe = isEditMode
    ? createdRecipesStore((s) => s.findById)(recipeId)
    : undefined;

  const [step, setStep] = useState<WizardStep>(isEditMode ? 1 : 0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiError, setAiError] = useState<string | undefined>(undefined);
  const [wasAiUsed, setWasAiUsed] = useState(false);

  const [form, setForm] = useState<RecipeFormState>(() =>
    isEditMode && existingRecipe !== undefined
      ? recipeToForm(existingRecipe, [...existingRecipe.media])
      : emptyForm,
  );
  const [missing, setMissing] = useState(false);
  const [hasNewImage, setHasNewImage] = useState(false);

  const aiLoading = generateState.status === 'generating';

  const handleGenerate = async (): Promise<void> => {
    const trimmed = aiPrompt.trim();
    if (trimmed.length === 0 || aiLoading) return;
    setAiError(undefined);
    const locale = getLocale();
    await createdRecipesStore.getState().generateRecipe(trimmed, locale);
    const state = createdRecipesStore.getState().generateState;
    if (state.status === 'success') {
      setForm(recipeToForm(state.recipe, form.media));
      setWasAiUsed(true);
      setStep(5);
      createdRecipesStore.getState().resetGenerateState();
      return;
    }
    if (state.status === 'error') {
      setAiError(t().createRecipe.aiError);
    }
  };

  const handleManualStart = (): void => {
    setForm(emptyForm);
    setWasAiUsed(false);
    setStep(1);
  };

  const handleIdeaChip = (chip: string): void => {
    const lower = chip.toLowerCase();
    setAiPrompt((p) => (p.trim().length === 0 ? chip : `${p}, ${lower}`));
  };

  const updateField = <K extends keyof RecipeFormState>(
    key: K,
    value: RecipeFormState[K],
  ): void => setForm((f) => ({ ...f, [key]: value }));

  const updateIngredient = (i: number, value: string): void =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((x, idx) => (idx === i ? value : x)),
    }));
  const removeIngredient = (i: number): void =>
    setForm((f) => ({
      ...f,
      ingredients:
        f.ingredients.length <= 1
          ? ['']
          : f.ingredients.filter((_, idx) => idx !== i),
    }));
  const addIngredient = (): void =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, ''] }));

  const updateInstruction = (i: number, value: string): void =>
    setForm((f) => ({
      ...f,
      instructions: f.instructions.map((x, idx) => (idx === i ? value : x)),
    }));
  const removeInstruction = (i: number): void =>
    setForm((f) => ({
      ...f,
      instructions:
        f.instructions.length <= 1
          ? ['']
          : f.instructions.filter((_, idx) => idx !== i),
    }));
  const addInstruction = (): void =>
    setForm((f) => ({ ...f, instructions: [...f.instructions, ''] }));

  const onMediaAdd = (items: MediaItem[]): void => {
    setForm((f) => ({
      ...f,
      // In edit mode put new items first so they auto-become the cover image.
      media: isEditMode ? [...items, ...f.media] : [...f.media, ...items],
    }));
    setHasNewImage(true);
  };
  const onMediaRemove = (i: number): void =>
    setForm((f) => ({ ...f, media: f.media.filter((_, idx) => idx !== i) }));
  const onMediaSetCover = (i: number): void =>
    setForm((f) => {
      const arr = [...f.media];
      const [picked] = arr.splice(i, 1);
      if (picked === undefined) return f;
      return { ...f, media: [picked, ...arr] };
    });

  const canNext = (): boolean => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 3)
      return form.ingredients.some((s) => s.trim().length > 0);
    if (step === 4)
      return form.instructions.some((s) => s.trim().length > 0);
    return true;
  };

  const handleNext = (): void => {
    if (!canNext()) return;
    if (step < 5) setStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = (): void => {
    if (step <= 1) {
      if (step === 1 && !isEditMode) setStep(0);
      else router.back();
      return;
    }
    setStep((s) => (s - 1) as WizardStep);
  };

  const handleClose = (): void => {
    router.back();
  };

  const handlePublishManual = async (): Promise<void> => {
    const coverImage = form.media.find((m) => m.type === 'image');
    if (coverImage === undefined) {
      setMissing(true);
      return;
    }
    setMissing(false);
    const locale = getLocale();
    const cuisine = form.cuisine || 'OTHER';
    const category = form.category || 'DINNER';
    const uri = coverImage.url;
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
    };
    const mime = mimeMap[ext] ?? 'image/jpeg';
    const cleanIngredients = form.ingredients
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const cleanInstructions = form.instructions
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    await createdRecipesStore.getState().createRecipe({
      name: { [locale]: form.name.trim() },
      cuisine,
      category,
      difficulty: form.difficulty,
      ingredients: { [locale]: cleanIngredients },
      instructions: { [locale]: cleanInstructions },
      prepTimeMinutes: form.prepTimeMinutes,
      cookTimeMinutes: form.cookTimeMinutes,
      imageUri: uri,
      imageFileName: `recipe-${Date.now()}.${ext}`,
      imageMimeType: mime,
      tags: { [locale]: [DIFFICULTY_LABELS[form.difficulty]] },
      mealType: { [locale]: [] },
      isPublished: true,
      locale,
    });

    const state = createdRecipesStore.getState().createState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetCreateState();
      router.replace('/my-recipes');
    }
  };

  const handleUpdate = async (): Promise<void> => {
    const locale = getLocale();
    const cleanIngredients = form.ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
    const cleanInstructions = form.instructions.map((s) => s.trim()).filter((s) => s.length > 0);

    const input: UpdateRecipeInput = {
      name: { [locale]: form.name.trim() },
      ...(form.cuisine ? { cuisine: form.cuisine } : {}),
      ...(form.category ? { category: form.category } : {}),
      difficulty: form.difficulty,
      ingredients: { [locale]: cleanIngredients },
      instructions: { [locale]: cleanInstructions },
      prepTimeMinutes: form.prepTimeMinutes,
      cookTimeMinutes: form.cookTimeMinutes,
      servings: form.servings,
      tags: { [locale]: [DIFFICULTY_LABELS[form.difficulty]] },
      mealType: { [locale]: [] },
      isPublished: true,
      locale,
    };

    if (hasNewImage) {
      // WHY: only upload a LOCAL file — remote https:// URLs are already on the
      // server and re-uploading them via RN FormData { uri } fails on iOS/Android
      // because native XHR does not reliably stream remote URIs as multipart.
      const localImage = form.media.find(
        (m) => m.type === 'image' && !m.url.startsWith('http'),
      );
      if (localImage !== undefined) {
        const uri = localImage.url;
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          heic: 'image/heic',
        };
        input.imageUri = uri;
        input.imageFileName = `recipe-${Date.now()}.${ext}`;
        input.imageMimeType = mimeMap[ext] ?? 'image/jpeg';
      }
    }

    if (recipeId === undefined || recipeId.length === 0) return;
    await createdRecipesStore.getState().updateRecipe(recipeId, input);

    const state = createdRecipesStore.getState().updateState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetUpdateState();
      router.back();
    }
  };

  const handlePublishAi = async (): Promise<void> => {
    if (hasNewImage && aiDraft !== null) {
      const coverImage = form.media.find((m) => m.type === 'image');
      if (coverImage !== undefined) {
        const uri = coverImage.url;
        const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          heic: 'image/heic',
        };
        await createdRecipesStore.getState().updateRecipe(aiDraft.id, {
          imageUri: uri,
          imageFileName: `recipe-${Date.now()}.${ext}`,
          imageMimeType: mimeMap[ext] ?? 'image/jpeg',
        });
        // If the image update failed, stay on review so the error is visible.
        if (createdRecipesStore.getState().updateState.status === 'error') return;
      }
    }
    createdRecipesStore.getState().clearAiDraft();
    router.replace('/my-recipes');
  };

  const handleSave = (): void => {
    if (isEditMode) {
      void handleUpdate();
      return;
    }
    if (wasAiUsed) {
      handlePublishAi();
      return;
    }
    void handlePublishManual();
  };

  if (step === 0) {
    return renderPromptStep({
      colors,
      insets,
      aiPrompt,
      setAiPrompt,
      aiLoading,
      aiError,
      onGenerate: () => void handleGenerate(),
      onManual: handleManualStart,
      onClose: handleClose,
      onIdeaChip: handleIdeaChip,
    });
  }

  const labels = stepLabels();
  const currentLabel = labels[step - 1] ?? '';
  const progress = step / 5;
  const isPublishing = createState.status === 'creating';
  const isSaving = isEditMode
    ? updateState.status === 'updating'
    : isPublishing || (wasAiUsed && updateState.status === 'updating');
  const continueDisabled = !canNext();

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ResponsiveContainer route="createRecipe" gutter={false} fill>
      <View
        style={[
          styles.wizardHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: isWebShell ? spacing.md : insets.top + spacing.sm,
          },
        ]}
      >
        <Pressable onPress={handleBack} style={styles.iconBtn} hitSlop={8}>
          <Ionicons
            name={step > 1 ? 'chevron-back' : 'close'}
            size={20}
            color={colors.text}
          />
        </Pressable>
        <View style={styles.wizardHeaderCenter}>
          <ThemedText
            variant="caption"
            style={[styles.wizardHeaderCount, { color: colors.textMuted }]}
          >
            {`${step}/5`}
          </ThemedText>
          <ThemedText
            variant="subtitle"
            style={[styles.wizardHeaderTitle, { color: colors.text }]}
          >
            {currentLabel}
          </ThemedText>
        </View>
        <View style={styles.iconBtn} />
      </View>
      <View
        style={[styles.progressTrack, { backgroundColor: colors.border }]}
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={[
          styles.stepScrollInner,
          { paddingBottom: sizes.heroSquare + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1
          ? renderStep1({ form, colors, updateField })
          : step === 2
            ? renderStep2({
                form,
                onMediaAdd,
                onMediaRemove,
                onMediaSetCover,
              })
            : step === 3
              ? renderStep3({
                  form,
                  colors,
                  updateIngredient,
                  removeIngredient,
                  addIngredient,
                })
              : step === 4
                ? renderStep4({
                    form,
                    colors,
                    updateInstruction,
                    removeInstruction,
                    addInstruction,
                  })
                : renderStep5({
                    form,
                    colors,
                    missing,
                    wasAiUsed,
                    createError: !isEditMode && !wasAiUsed && createState.status === 'error',
                    updateError: (isEditMode || wasAiUsed) && updateState.status === 'error',
                    failureMessage:
                      createState.status === 'error'
                        ? createState.failure.message
                        : updateState.status === 'error'
                          ? updateState.failure.message
                          : undefined,
                    onEditMedia: () => setStep(2),
                    onEditIngredients: () => setStep(3),
                    onEditInstructions: () => setStep(4),
                  })}
      </ScrollView>

      <View
        style={[
          styles.stickyBottom,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: isWebShell ? spacing.md : insets.bottom + spacing.md,
          },
        ]}
      >
        {step > 1 ? (
          <Pressable
            onPress={handleBack}
            style={[
              styles.bottomBackBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <ThemedText
              variant="body"
              style={[styles.bottomBackLabel, { color: colors.text }]}
            >
              {t().createRecipe.back}
            </ThemedText>
          </Pressable>
        ) : null}
        {step < 5 ? (
          <Pressable
            onPress={handleNext}
            disabled={continueDisabled}
            style={[styles.bottomPrimary, shadows.md]}
          >
            <LinearGradient
              colors={
                continueDisabled
                  ? [colors.border, colors.border]
                  : [colors.primaryGradientStart, colors.primaryGradientEnd]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomPrimaryInner}
            >
              <ThemedText
                variant="body"
                style={[
                  styles.bottomPrimaryLabel,
                  {
                    color: continueDisabled ? colors.textMuted : colors.primaryText,
                  },
                ]}
              >
                {t().createRecipe.continue}
              </ThemedText>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.bottomPrimary, shadows.md, { opacity: isSaving ? 0.6 : 1 }]}
          >
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomPrimaryInner}
            >
              <ThemedText
                variant="body"
                style={[styles.bottomPrimaryLabel, { color: colors.primaryText }]}
              >
                {isEditMode
                  ? (updateState.status === 'updating' ? t().createRecipe.updating : t().createRecipe.updateSave)
                  : isSaving
                    ? t().createRecipe.publishing
                    : t().createRecipe.save}
              </ThemedText>
            </LinearGradient>
          </Pressable>
        )}
      </View>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
};

// ============================ Step 0 (AI prompt) ============================

interface PromptStepArgs {
  colors: ThemeColors;
  insets: { top: number; bottom: number; left: number; right: number };
  aiPrompt: string;
  setAiPrompt: (next: string) => void;
  aiLoading: boolean;
  aiError: string | undefined;
  onGenerate: () => void;
  onManual: () => void;
  onClose: () => void;
  onIdeaChip: (chip: string) => void;
}

const renderPromptStep = (args: PromptStepArgs): React.JSX.Element => {
  const {
    colors,
    insets,
    aiPrompt,
    setAiPrompt,
    aiLoading,
    aiError,
    onGenerate,
    onManual,
    onClose,
    onIdeaChip,
  } = args;
  const generateDisabled = aiLoading || aiPrompt.trim().length === 0;
  const ideaChips = t().createRecipe.ideaChips;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ResponsiveContainer route="createRecipe" gutter={false} fill>
      <View
        style={[
          styles.promptHeader,
          {
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={onClose}
          style={[
            styles.iconBtnBordered,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
          hitSlop={8}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.promptHeaderTitle}>
          {t().createRecipe.title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.promptScroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.promptBody}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroSquare, shadows.lg]}
          >
            <ThemedText style={[styles.heroSparkle, { color: colors.primaryText }]}>✨</ThemedText>
          </LinearGradient>

          <View style={styles.promptHeadingBlock}>
            <ThemedText variant="headline" style={styles.promptHero}>
              {t().createRecipe.aiHero}
            </ThemedText>
            <ThemedText
              variant="body"
              style={[styles.promptHeroSub, { color: colors.textMuted }]}
            >
              {t().createRecipe.aiHeroSub}
            </ThemedText>
          </View>

          <View style={styles.promptForm}>
            <View style={[styles.promptInputShadow, shadows.sm]}>
              <TextInput
                value={aiPrompt}
                onChangeText={setAiPrompt}
                placeholder={t().createRecipe.aiPromptPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                style={[
                  styles.promptInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            <View style={styles.chipRow}>
              {ideaChips.map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => onIdeaChip(chip)}
                  style={[
                    styles.ideaChip,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={[styles.ideaChipLabel, { color: colors.text }]}
                  >
                    {chip}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={onGenerate}
              disabled={generateDisabled}
              style={[
                styles.promptCta,
                shadows.md,
                { opacity: generateDisabled ? 0.5 : 1 },
              ]}
            >
              <LinearGradient
                colors={[
                  colors.primaryGradientStart,
                  colors.primaryGradientEnd,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promptCtaInner}
              >
                <ThemedText
                  variant="body"
                  style={[styles.promptCtaLabel, { color: colors.primaryText }]}
                >
                  {aiLoading
                    ? t().createRecipe.aiGenerating
                    : `✨  ${t().createRecipe.aiButton}`}
                </ThemedText>
              </LinearGradient>
            </Pressable>
            {aiError !== undefined ? (
              <ThemedText
                variant="caption"
                style={[styles.promptError, { color: colors.danger }]}
              >
                {aiError}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.dividerRow}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <ThemedText
              variant="caption"
              style={[styles.dividerLabel, { color: colors.textMuted }]}
            >
              {t().createRecipe.or}
            </ThemedText>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          <Pressable
            onPress={onManual}
            style={[
              styles.manualBtn,
              { borderColor: colors.border, backgroundColor: 'transparent' },
            ]}
          >
            <ThemedText
              variant="body"
              style={[styles.manualBtnLabel, { color: colors.text }]}
            >
              {t().createRecipe.manualButton}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
};

// ============================ Step 1 (Basics) ===============================

interface Step1Args {
  form: RecipeFormState;
  colors: ThemeColors;
  updateField: <K extends keyof RecipeFormState>(
    key: K,
    value: RecipeFormState[K],
  ) => void;
}

const renderStep1 = (args: Step1Args): React.JSX.Element => {
  const { form, colors, updateField } = args;
  const fieldStyle: StyleProp<TextStyle> = {
    height: sizes.buttonSmHeight,
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
    color: colors.text,
  };

  return (
    <View style={styles.fieldGroup}>
      <View>
        <ThemedText
          variant="label"
          style={[styles.fieldLabel, { color: colors.textMuted }]}
        >
          {t().createRecipe.name}
        </ThemedText>
        <TextInput
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
          placeholder={t().createRecipe.namePlaceholder}
          placeholderTextColor={colors.textMuted}
          style={fieldStyle}
        />
      </View>

      <View>
        <ThemedText
          variant="label"
          style={[styles.fieldLabel, { color: colors.textMuted }]}
        >
          {t().createRecipe.cuisine}
        </ThemedText>
        <View style={styles.chipsWrap}>
          {CUISINE_KEY_VALUES.map((c) => {
            const isActive = form.cuisine === c;
            return (
              <Pressable
                key={c}
                onPress={() => updateField('cuisine', c)}
                style={[
                  styles.enumChip,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : colors.surface,
                  },
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.enumChipLabel, { color: isActive ? colors.primaryText : colors.text }]}
                >
                  {formatLabel(c)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <ThemedText
          variant="label"
          style={[styles.fieldLabel, { color: colors.textMuted }]}
        >
          {t().createRecipe.category}
        </ThemedText>
        <View style={styles.chipsWrap}>
          {RECIPE_CATEGORY_VALUES.map((c) => {
            const isActive = form.category === c;
            return (
              <Pressable
                key={c}
                onPress={() => updateField('category', c)}
                style={[
                  styles.enumChip,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : colors.surface,
                  },
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.enumChipLabel, { color: isActive ? colors.primaryText : colors.text }]}
                >
                  {formatLabel(c)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <ThemedText
          variant="label"
          style={[styles.fieldLabel, { color: colors.textMuted }]}
        >
          {t().createRecipe.difficulty}
        </ThemedText>
        <View style={styles.difficultyRow}>
          {DIFFICULTIES.map((d) => {
            const isActive = form.difficulty === d;
            return (
              <Pressable
                key={d}
                onPress={() => updateField('difficulty', d)}
                style={[
                  styles.difficultyBtn,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surface,
                  },
                ]}
              >
                <ThemedText
                  variant="body"
                  style={[
                    styles.difficultyLabel,
                    {
                      color: isActive ? colors.primaryText : colors.text,
                    },
                  ]}
                >
                  {DIFFICULTY_LABELS[d]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View style={styles.servingsHeaderRow}>
          <ThemedText
            variant="label"
            style={[styles.fieldLabel, { color: colors.textMuted }]}
          >
            {t().createRecipe.servings}
          </ThemedText>
          <ThemedText
            style={[styles.servingsValue, { color: colors.primary }]}
          >
            {form.servings}
          </ThemedText>
        </View>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() =>
              updateField(
                'servings',
                clamp(form.servings - 1, SERVINGS_MIN, SERVINGS_MAX),
              )
            }
            disabled={form.servings <= SERVINGS_MIN}
            style={[
              styles.stepperBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: form.servings <= SERVINGS_MIN ? 0.4 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.stepperBtnLabel, { color: colors.text }]}
            >
              −
            </ThemedText>
          </Pressable>
          <View style={styles.stepperSliderWrap}>
            <Slider
              value={form.servings}
              min={SERVINGS_MIN}
              max={SERVINGS_MAX}
              step={1}
              onChange={(v) => updateField('servings', v)}
            />
          </View>
          <Pressable
            onPress={() =>
              updateField(
                'servings',
                clamp(form.servings + 1, SERVINGS_MIN, SERVINGS_MAX),
              )
            }
            disabled={form.servings >= SERVINGS_MAX}
            style={[
              styles.stepperBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: form.servings >= SERVINGS_MAX ? 0.4 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.stepperBtnLabel, { color: colors.text }]}
            >
              +
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.timeCardsRow}>
        <TimeSliderCard
          label={t().createRecipe.prepTime}
          value={form.prepTimeMinutes}
          icon="time-outline"
          onChange={(v) => updateField('prepTimeMinutes', v)}
          colors={colors}
        />
        <TimeSliderCard
          label={t().createRecipe.cookTime}
          value={form.cookTimeMinutes}
          icon="flame-outline"
          onChange={(v) => updateField('cookTimeMinutes', v)}
          colors={colors}
        />
      </View>
    </View>
  );
};

// ============================ Step 2 (Media) ================================

interface Step2Args {
  form: RecipeFormState;
  onMediaAdd: (items: MediaItem[]) => void;
  onMediaRemove: (i: number) => void;
  onMediaSetCover: (i: number) => void;
}

const renderStep2 = (args: Step2Args): React.JSX.Element => (
  <View>
    <MediaPicker
      media={args.form.media}
      onAdd={args.onMediaAdd}
      onRemove={args.onMediaRemove}
      onSetCover={args.onMediaSetCover}
    />
  </View>
);

// ============================ Step 3 (Ingredients) ==========================

interface Step3Args {
  form: RecipeFormState;
  colors: ThemeColors;
  updateIngredient: (i: number, value: string) => void;
  removeIngredient: (i: number) => void;
  addIngredient: () => void;
}

const renderStep3 = (args: Step3Args): React.JSX.Element => {
  const { form, colors, updateIngredient, removeIngredient, addIngredient } =
    args;
  return (
    <View>
      <View style={styles.listHeader}>
        <ThemedText variant="title" style={{ color: colors.text }}>
          {t().createRecipe.ingredients}
        </ThemedText>
        <ThemedText variant="caption" muted>
          {form.ingredients.length} {t().createRecipe.items}
        </ThemedText>
      </View>
      <View style={styles.listBody}>
        {form.ingredients.map((ing, i) => (
          <View
            key={`ing-${i}`}
            style={[
              styles.ingredientRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.ingredientBadge,
                { backgroundColor: colors.chipBackground },
              ]}
            >
              <ThemedText
                variant="caption"
                style={[
                  styles.ingredientBadgeLabel,
                  { color: colors.textMuted },
                ]}
              >
                {i + 1}
              </ThemedText>
            </View>
            <TextInput
              value={ing}
              onChangeText={(v) => updateIngredient(i, v)}
              placeholder={t().createRecipe.ingredientPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={[styles.ingredientInput, { color: colors.text }]}
            />
            <Pressable
              onPress={() => removeIngredient(i)}
              style={styles.iconBtnGhost}
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={addIngredient}
          style={[
            styles.dashedAddBtn,
            { borderColor: colors.primary },
          ]}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <ThemedText
            variant="body"
            style={[styles.dashedAddLabel, { color: colors.primary }]}
          >
            {t().createRecipe.addIngredient}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

// ============================ Step 4 (Instructions) =========================

interface Step4Args {
  form: RecipeFormState;
  colors: ThemeColors;
  updateInstruction: (i: number, value: string) => void;
  removeInstruction: (i: number) => void;
  addInstruction: () => void;
}

const renderStep4 = (args: Step4Args): React.JSX.Element => {
  const { form, colors, updateInstruction, removeInstruction, addInstruction } =
    args;
  return (
    <View>
      <View style={styles.listHeader}>
        <ThemedText variant="title" style={{ color: colors.text }}>
          {t().createRecipe.instructions}
        </ThemedText>
        <ThemedText variant="caption" muted>
          {form.instructions.length} {t().createRecipe.steps}
        </ThemedText>
      </View>
      <View style={styles.listBody}>
        {form.instructions.map((stepText, i) => (
          <View
            key={`inst-${i}`}
            style={[
              styles.instructionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.instructionBadge}
            >
              <ThemedText style={[styles.instructionBadgeLabel, { color: colors.primaryText }]}>
                {i + 1}
              </ThemedText>
            </LinearGradient>
            <TextInput
              value={stepText}
              onChangeText={(v) => updateInstruction(i, v)}
              placeholder={t().createRecipe.stepPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.instructionInput, { color: colors.text }]}
            />
            <Pressable
              onPress={() => removeInstruction(i)}
              style={styles.iconBtnGhost}
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={addInstruction}
          style={[
            styles.dashedAddBtn,
            { borderColor: colors.primary },
          ]}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <ThemedText
            variant="body"
            style={[styles.dashedAddLabel, { color: colors.primary }]}
          >
            {t().createRecipe.addStep}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

// ============================ Step 5 (Review) ===============================

interface Step5Args {
  form: RecipeFormState;
  colors: ThemeColors;
  missing: boolean;
  wasAiUsed: boolean;
  createError: boolean;
  updateError: boolean;
  failureMessage: string | undefined;
  onEditMedia: () => void;
  onEditIngredients: () => void;
  onEditInstructions: () => void;
}

const renderStep5 = (args: Step5Args): React.JSX.Element => {
  const {
    form,
    colors,
    missing,
    wasAiUsed,
    createError,
    updateError,
    failureMessage,
    onEditMedia,
    onEditIngredients,
    onEditInstructions,
  } = args;
  const coverImage = form.media.find((m) => m.type === 'image');
  const cleanIngredients = form.ingredients.filter((s) => s.trim().length > 0);
  const cleanInstructions = form.instructions.filter((s) => s.trim().length > 0);
  const totalTime = form.prepTimeMinutes + form.cookTimeMinutes;
  const chips: string[] = [];
  if (form.cuisine.length > 0) chips.push(formatLabel(form.cuisine));
  if (form.category.length > 0) chips.push(formatLabel(form.category));
  chips.push(DIFFICULTY_LABELS[form.difficulty]);
  chips.push(`${form.servings} ${t().recipes.servings}`);
  chips.push(`${totalTime} ${t().recipes.minutes}`);

  return (
    <View style={styles.reviewWrap}>
      <ThemedText variant="title" style={[styles.reviewTitle, { color: colors.text }]}>
        {t().createRecipe.reviewTitle}
      </ThemedText>

      <View
        style={[
          styles.reviewCard,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <Pressable
          onPress={onEditMedia}
          accessibilityRole="button"
          accessibilityLabel={t().mediaPicker.add}
        >
          {coverImage !== undefined ? (
            <View>
              <Image
                source={{ uri: coverImage.url }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
              <View style={[styles.reviewEditBadge, { backgroundColor: colors.overlay }]}>
                <Ionicons name="camera-outline" size={16} color={colors.onOverlay} />
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.reviewImagePlaceholder,
                { backgroundColor: colors.chipBackground },
              ]}
            >
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
              <ThemedText
                variant="caption"
                style={[styles.reviewEditHint, { color: colors.primary }]}
              >
                {t().mediaPicker.add}
              </ThemedText>
            </View>
          )}
        </Pressable>
        <View style={styles.reviewCardBody}>
          <ThemedText variant="title" style={{ color: colors.text }}>
            {form.name.trim().length > 0 ? form.name.trim() : '—'}
          </ThemedText>
          <View style={styles.reviewChipsRow}>
            {chips.map((chip, idx) => (
              <View
                key={`${idx}-${chip}`}
                style={[
                  styles.reviewChip,
                  { backgroundColor: colors.chipBackground },
                ]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.reviewChipLabel, { color: colors.chipText }]}
                >
                  {chip}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ReviewRowItem
        label={t().createRecipe.ingredients}
        count={cleanIngredients.length}
        unitLabel={t().createRecipe.items}
        onPress={onEditIngredients}
        colors={colors}
      />
      <ReviewRowItem
        label={t().createRecipe.instructions}
        count={cleanInstructions.length}
        unitLabel={t().createRecipe.steps}
        onPress={onEditInstructions}
        colors={colors}
      />

      {missing ? (
        <ThemedText
          variant="caption"
          style={[styles.reviewError, { color: colors.danger }]}
        >
          {t().createRecipe.noImage}
        </ThemedText>
      ) : null}
      {createError ? (
        <ThemedText
          variant="caption"
          style={[styles.reviewError, { color: colors.danger }]}
        >
          {t().createRecipe.saveError}
        </ThemedText>
      ) : null}
      {updateError ? (
        <ThemedText
          variant="caption"
          style={[styles.reviewError, { color: colors.danger }]}
        >
          {t().createRecipe.updateError}
        </ThemedText>
      ) : null}
      {(createError || updateError) && failureMessage !== undefined ? (
        <ThemedText
          variant="caption"
          style={[styles.reviewError, { color: colors.danger }]}
        >
          {failureMessage}
        </ThemedText>
      ) : null}
      {wasAiUsed ? (
        <ThemedText
          variant="caption"
          style={[styles.reviewCaption, { color: colors.textMuted }]}
        >
          {t().createRecipe.aiSavedDraft}
        </ThemedText>
      ) : null}
    </View>
  );
};

// ================================ Styles ===================================

const styles = StyleSheet.create<{
  root: ViewStyle;
  promptHeader: ViewStyle;
  promptHeaderTitle: TextStyle;
  headerSpacer: ViewStyle;
  promptScroll: ViewStyle;
  promptBody: ViewStyle;
  heroSquare: ViewStyle;
  heroSparkle: TextStyle;
  promptHeadingBlock: ViewStyle;
  promptHero: TextStyle;
  promptHeroSub: TextStyle;
  promptForm: ViewStyle;
  promptInputShadow: ViewStyle;
  promptInput: TextStyle;
  chipRow: ViewStyle;
  ideaChip: ViewStyle;
  ideaChipLabel: TextStyle;
  promptCta: ViewStyle;
  promptCtaInner: ViewStyle;
  promptCtaLabel: TextStyle;
  promptError: TextStyle;
  dividerRow: ViewStyle;
  dividerLine: ViewStyle;
  dividerLabel: TextStyle;
  manualBtn: ViewStyle;
  manualBtnLabel: TextStyle;
  wizardHeader: ViewStyle;
  iconBtn: ViewStyle;
  iconBtnBordered: ViewStyle;
  iconBtnGhost: ViewStyle;
  wizardHeaderCenter: ViewStyle;
  wizardHeaderCount: TextStyle;
  wizardHeaderTitle: TextStyle;
  progressTrack: ViewStyle;
  progressFill: ViewStyle;
  stepScroll: ViewStyle;
  stepScrollInner: ViewStyle;
  stickyBottom: ViewStyle;
  bottomBackBtn: ViewStyle;
  bottomBackLabel: TextStyle;
  bottomPrimary: ViewStyle;
  bottomPrimaryInner: ViewStyle;
  bottomPrimaryLabel: TextStyle;
  fieldGroup: ViewStyle;
  fieldLabel: TextStyle;
  chipsWrap: ViewStyle;
  enumChip: ViewStyle;
  enumChipLabel: TextStyle;
  difficultyRow: ViewStyle;
  difficultyBtn: ViewStyle;
  difficultyLabel: TextStyle;
  servingsHeaderRow: ViewStyle;
  servingsValue: TextStyle;
  stepperRow: ViewStyle;
  stepperBtn: ViewStyle;
  stepperBtnLabel: TextStyle;
  stepperSliderWrap: ViewStyle;
  timeCardsRow: ViewStyle;
  listHeader: ViewStyle;
  listBody: ViewStyle;
  ingredientRow: ViewStyle;
  ingredientBadge: ViewStyle;
  ingredientBadgeLabel: TextStyle;
  ingredientInput: TextStyle;
  instructionCard: ViewStyle;
  instructionBadge: ViewStyle;
  instructionBadgeLabel: TextStyle;
  instructionInput: TextStyle;
  dashedAddBtn: ViewStyle;
  dashedAddLabel: TextStyle;
  reviewWrap: ViewStyle;
  reviewTitle: TextStyle;
  reviewCard: ViewStyle;
  reviewImage: ImageStyle;
  reviewImagePlaceholder: ViewStyle;
  reviewCardBody: ViewStyle;
  reviewChipsRow: ViewStyle;
  reviewChip: ViewStyle;
  reviewChipLabel: TextStyle;
  reviewError: TextStyle;
  reviewCaption: TextStyle;
  reviewEditBadge: ViewStyle;
  reviewEditHint: TextStyle;
}>({
  root: {
    flex: 1,
  },
  // Prompt header (step 0)
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  promptHeaderTitle: {
    textAlign: 'center',
  },
  headerSpacer: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
  },
  promptScroll: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  promptBody: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroSquare: {
    width: sizes.heroSquare,
    height: sizes.heroSquare,
    borderRadius: radii.xxl2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSparkle: {
    fontSize: fontSizes.hero,
  },
  promptHeadingBlock: {
    alignItems: 'center',
    maxWidth: 320,
  },
  promptHero: {
    textAlign: 'center',
  },
  promptHeroSub: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  promptForm: {
    width: '100%',
  },
  promptInputShadow: {
    borderRadius: radii.xl,
  },
  promptInput: {
    minHeight: sizes.promptInputMin,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSizes.body,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
    marginTop: spacing.sm,
  },
  ideaChip: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaChipLabel: {
    fontSize: fontSizes.small,
    fontWeight: '500',
  },
  promptCta: {
    marginTop: spacing.md,
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  promptCtaInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCtaLabel: {
    fontWeight: '700',
    fontSize: fontSizes.heading,
  },
  promptError: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: fontSizes.small,
  },
  manualBtn: {
    width: '100%',
    height: sizes.buttonSmHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualBtnLabel: {
    fontWeight: '600',
    fontSize: fontSizes.medium,
  },
  // Wizard header
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
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
  iconBtnBordered: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnGhost: {
    width: sizes.iconBtnSm,
    height: sizes.iconBtnSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardHeaderCenter: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  wizardHeaderCount: {
    fontSize: fontSizes.micro,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  wizardHeaderTitle: {
    fontSize: fontSizes.body,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
  },
  stepScroll: {
    flex: 1,
  },
  stepScrollInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  // Sticky bottom action bar
  stickyBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomBackBtn: {
    height: sizes.buttonHeight,
    paddingHorizontal: spacing.lg2,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBackLabel: {
    fontWeight: '600',
    fontSize: fontSizes.body,
  },
  bottomPrimary: {
    flex: 1,
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  bottomPrimaryInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPrimaryLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  // Step 1 fields
  fieldGroup: {
    gap: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
  },
  enumChip: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enumChipLabel: {
    fontWeight: '600',
    fontSize: fontSizes.caption,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: spacing.xs2,
  },
  difficultyBtn: {
    flex: 1,
    height: sizes.searchBarHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyLabel: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  servingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  servingsValue: {
    fontSize: fontSizes.display,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperBtn: {
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.round,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnLabel: {
    fontSize: fontSizes.subheading,
    fontWeight: '600',
    lineHeight: 22,
  },
  stepperSliderWrap: {
    flex: 1,
  },
  timeCardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  // List shared (steps 3 and 4)
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  listBody: {
    gap: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  ingredientBadge: {
    width: sizes.badgeSm,
    height: sizes.badgeSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBadgeLabel: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
  },
  ingredientInput: {
    flex: 1,
    height: sizes.iconBtn,
    fontSize: fontSizes.medium,
    paddingVertical: 0,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  instructionBadge: {
    width: sizes.iconBtnSm,
    height: sizes.iconBtnSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBadgeLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  instructionInput: {
    flex: 1,
    fontSize: fontSizes.medium,
    lineHeight: 20,
    minHeight: sizes.textAreaMin,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  dashedAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    height: sizes.buttonSmHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    marginTop: spacing.xs,
  },
  dashedAddLabel: {
    fontWeight: '600',
    fontSize: fontSizes.medium,
  },
  // Step 5 review
  reviewWrap: {
    gap: spacing.md,
  },
  reviewTitle: {},
  reviewCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reviewImage: {
    width: '100%',
    height: sizes.reviewImageHeight,
  },
  reviewImagePlaceholder: {
    width: '100%',
    height: sizes.reviewImageHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
  },
  reviewChip: {
    paddingHorizontal: spacing.sm2,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
  },
  reviewChipLabel: {
    fontSize: fontSizes.small,
    fontWeight: '500',
  },
  reviewError: {
    textAlign: 'center',
  },
  reviewCaption: {
    textAlign: 'center',
  },
  reviewEditBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: sizes.iconBtnSm,
    height: sizes.iconBtnSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewEditHint: {
    marginTop: spacing.xs,
  },
});
