import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { MediaPicker } from '@presentation/base/widgets/media-picker';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t, getLocale } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';
import {
  generateAiRecipe,
  isAiConfigured,
  type RecipeDraft,
} from '@application/recipes/generate-ai-recipe';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
const DIFFICULTIES: readonly Difficulty[] = ['Easy', 'Medium', 'Hard'];

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

interface RecipeFormState {
  name: string;
  cuisine: string;
  difficulty: Difficulty;
  prepTimeMinutes: string;
  cookTimeMinutes: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  media: MediaItem[];
}

const emptyForm: RecipeFormState = {
  name: '',
  cuisine: '',
  difficulty: 'Easy',
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  servings: '',
  ingredients: [''],
  instructions: [''],
  media: [],
};

const draftToForm = (
  draft: RecipeDraft,
  prevMedia: MediaItem[],
): RecipeFormState => ({
  name: draft.name,
  cuisine: draft.cuisine,
  difficulty: draft.difficulty,
  prepTimeMinutes: String(draft.prepTimeMinutes ?? ''),
  cookTimeMinutes: String(draft.cookTimeMinutes ?? ''),
  servings: String(draft.servings ?? ''),
  ingredients: draft.ingredients.length > 0 ? draft.ingredients : [''],
  instructions: draft.instructions.length > 0 ? draft.instructions : [''],
  media: prevMedia,
});

const formToDraft = (form: RecipeFormState): RecipeDraft => ({
  name: form.name,
  cuisine: form.cuisine,
  difficulty: form.difficulty,
  prepTimeMinutes: parseInt(form.prepTimeMinutes, 10) || 0,
  cookTimeMinutes: parseInt(form.cookTimeMinutes, 10) || 0,
  servings: parseInt(form.servings, 10) || 0,
  ingredients: form.ingredients.filter((s) => s.trim().length > 0),
  instructions: form.instructions.filter((s) => s.trim().length > 0),
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const STEP_LABELS = (tr: ReturnType<typeof t>): readonly string[] => [
  tr.createRecipe.stepBasics,
  tr.createRecipe.stepMedia,
  tr.createRecipe.stepIngredients,
  tr.createRecipe.stepInstructions,
  tr.createRecipe.stepReview,
];

export const CreateRecipeScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { createdRecipesStore } = useStores();
  const createState = createdRecipesStore((s) => s.createState);

  const aiAvailable = isAiConfigured();

  const [step, setStep] = useState<WizardStep>(aiAvailable ? 0 : 1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>(undefined);

  const [form, setForm] = useState<RecipeFormState>(emptyForm);
  const [missingImage, setMissingImage] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const chatScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (chatScrollRef.current !== null) {
      chatScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory, chatLoading]);

  const handleGenerate = async (): Promise<void> => {
    if (aiPrompt.trim().length === 0) return;
    setAiLoading(true);
    setAiError(undefined);
    const result = await generateAiRecipe({
      prompt: aiPrompt,
      lang: getLocale() === 'tr' ? 'tr' : 'en',
    });
    setAiLoading(false);
    if (!result.ok) {
      setAiError(t().createRecipe.aiError);
      return;
    }
    setForm(draftToForm(result.value, form.media));
    setChatHistory([
      { role: 'user', content: aiPrompt },
      { role: 'assistant', content: t().createRecipe.aiFirstReply },
    ]);
    setStep(1);
  };

  const handleManual = (): void => {
    setForm(emptyForm);
    if (aiAvailable) {
      setChatHistory([
        { role: 'assistant', content: t().createRecipe.manualMode },
      ]);
    }
    setStep(1);
  };

  const handleSendChat = async (): Promise<void> => {
    const text = chatInput.trim();
    if (text.length === 0 || chatLoading) return;
    setChatInput('');
    const next: ChatMessage[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(next);
    setChatLoading(true);
    const result = await generateAiRecipe({
      prompt: text,
      lang: getLocale() === 'tr' ? 'tr' : 'en',
      previous: formToDraft(form),
    });
    setChatLoading(false);
    if (!result.ok) {
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', content: t().createRecipe.aiError, error: true },
      ]);
      return;
    }
    setForm(draftToForm(result.value, form.media));
    setChatHistory((h) => [
      ...h,
      { role: 'assistant', content: t().createRecipe.aiUpdated },
    ]);
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
      ingredients: f.ingredients.filter((_, idx) => idx !== i),
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
      instructions: f.instructions.filter((_, idx) => idx !== i),
    }));
  const addInstruction = (): void =>
    setForm((f) => ({ ...f, instructions: [...f.instructions, ''] }));

  const onMediaAdd = (items: MediaItem[]): void =>
    setForm((f) => ({ ...f, media: [...f.media, ...items] }));
  const onMediaRemove = (i: number): void =>
    setForm((f) => ({ ...f, media: f.media.filter((_, idx) => idx !== i) }));
  const onMediaSetCover = (i: number): void =>
    setForm((f) => {
      const arr = [...f.media];
      const [picked] = arr.splice(i, 1);
      if (picked === undefined) return f;
      return { ...f, media: [picked, ...arr] };
    });

  const canAdvance = (): boolean => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return form.ingredients.some((s) => s.trim().length > 0);
    if (step === 4) return form.instructions.some((s) => s.trim().length > 0);
    return true;
  };

  const handleNext = (): void => {
    if (!canAdvance()) return;
    if (step < 5) setStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = (): void => {
    if (step === 1) {
      if (aiAvailable) setStep(0);
    } else if (step > 1) {
      setStep((s) => (s - 1) as WizardStep);
    }
  };

  const handlePublish = async (): Promise<void> => {
    const coverImage = form.media.find((m) => m.type === 'image');
    if (!coverImage) {
      setMissingImage(true);
      return;
    }
    setMissingImage(false);
    const locale = getLocale();
    const cuisine = form.cuisine.trim() || 'Custom';
    const diffMap: Record<Difficulty, 'EASY' | 'MEDIUM' | 'HARD'> = {
      Easy: 'EASY',
      Medium: 'MEDIUM',
      Hard: 'HARD',
    };
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
    const cleanIngredients = form.ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
    const cleanInstructions = form.instructions.map((s) => s.trim()).filter((s) => s.length > 0);

    await createdRecipesStore.getState().createRecipe({
      name: { [locale]: form.name.trim() },
      cuisine: { [locale]: cuisine },
      difficulty: diffMap[form.difficulty],
      ingredients: { [locale]: cleanIngredients },
      instructions: { [locale]: cleanInstructions },
      prepTimeMinutes: parseInt(form.prepTimeMinutes, 10) || 0,
      cookTimeMinutes: parseInt(form.cookTimeMinutes, 10) || 0,
      imageUri: uri,
      imageFileName: `recipe-${Date.now()}.${ext}`,
      imageMimeType: mime,
      tags: { [locale]: [cuisine, form.difficulty] },
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

  const fieldStyle = (): React.ComponentProps<typeof TextInput>['style'] => ({
    height: 44,
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
  });

  const renderAppBar = (): React.JSX.Element => (
    <View
      style={[
        styles.appBar,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.appBarSide}>
        <ThemedText
          variant="body"
          style={[styles.appBarSideLabel, { color: colors.primary }]}
        >
          {t().createRecipe.cancel}
        </ThemedText>
      </Pressable>
      <ThemedText variant="subtitle">{t().createRecipe.title}</ThemedText>
      <View style={styles.appBarSide} />
    </View>
  );

  const renderStepIndicator = (): React.JSX.Element => {
    const labels = STEP_LABELS(t());
    return (
      <View style={[styles.stepIndicator, { borderBottomColor: colors.border }]}>
        {labels.map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isCurrent = step === stepNum;
          return (
            <View key={stepNum} style={styles.stepIndicatorItem}>
              {idx > 0 ? (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        step > idx ? colors.primary : colors.border,
                    },
                  ]}
                />
              ) : null}
              <View
                style={[
                  styles.stepCircle,
                  {
                    borderColor: isCurrent || isCompleted ? colors.primary : colors.border,
                    backgroundColor: isCurrent || isCompleted ? colors.primary : 'transparent',
                  },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={12} color={colors.primaryText} />
                ) : (
                  <ThemedText
                    variant="caption"
                    style={[
                      styles.stepCircleText,
                      {
                        color: isCurrent ? colors.primaryText : colors.textMuted,
                      },
                    ]}
                  >
                    {stepNum}
                  </ThemedText>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderBottomNav = (): React.JSX.Element => {
    const isPublishing = createState.status === 'creating';
    const isLastStep = step === 5;
    const nextDisabled = !canAdvance() || isPublishing;

    return (
      <View style={[styles.bottomNav, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleBack}
          disabled={step === 1 && !aiAvailable}
          style={[
            styles.bottomNavBtn,
            styles.bottomNavBtnOutline,
            {
              borderColor: colors.border,
              opacity: step === 1 && !aiAvailable ? 0.4 : 1,
            },
          ]}
        >
          <ThemedText variant="body" style={[styles.bottomNavBtnLabel, { color: colors.text }]}>
            {t().createRecipe.back}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={isLastStep ? () => void handlePublish() : handleNext}
          disabled={nextDisabled}
          style={[
            styles.bottomNavBtn,
            styles.bottomNavBtnFilled,
            {
              backgroundColor: colors.primary,
              opacity: nextDisabled ? 0.5 : 1,
            },
          ]}
        >
          <ThemedText
            variant="body"
            style={[styles.bottomNavBtnLabel, { color: colors.primaryText }]}
          >
            {isLastStep
              ? isPublishing
                ? t().createRecipe.publishing
                : t().createRecipe.publish
              : t().createRecipe.next}
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  const renderChatPanel = (): React.JSX.Element | null => {
    if (!aiAvailable) return null;
    return (
      <View
        style={[
          styles.chatPanel,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.cardBorder,
          },
        ]}
      >
        <Pressable
          onPress={() => setChatOpen((o) => !o)}
          style={styles.chatHeader}
        >
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chatAvatar}
          >
            <ThemedText style={styles.chatSparkle}>✦</ThemedText>
          </LinearGradient>
          <View style={styles.chatHeaderBody}>
            <ThemedText variant="caption" style={styles.chatTitle}>
              {t().createRecipe.chatTitle}
            </ThemedText>
            <ThemedText variant="caption" muted>
              {t().createRecipe.chatSubtitle}
            </ThemedText>
          </View>
          <Ionicons
            name={chatOpen ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
        {chatOpen ? (
          <>
            <ScrollView
              ref={chatScrollRef}
              style={styles.chatMessages}
              contentContainerStyle={styles.chatMessagesInner}
            >
              {chatHistory.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.chatBubble,
                    m.role === 'user' ? styles.chatBubbleRight : styles.chatBubbleLeft,
                    {
                      backgroundColor:
                        m.role === 'user'
                          ? colors.primary
                          : m.error === true
                            ? colors.warningLight
                            : colors.chipBackground,
                    },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={{
                      color:
                        m.role === 'user'
                          ? colors.primaryText
                          : m.error === true
                            ? colors.danger
                            : colors.text,
                    }}
                  >
                    {m.content}
                  </ThemedText>
                </View>
              ))}
              {chatLoading ? (
                <View
                  style={[
                    styles.chatBubble,
                    styles.chatBubbleLeft,
                    { backgroundColor: colors.chipBackground },
                  ]}
                >
                  <ThemedText variant="caption" muted style={styles.thinking}>
                    {t().createRecipe.aiThinking}
                  </ThemedText>
                </View>
              ) : null}
            </ScrollView>
            <View style={[styles.chatInputRow, { borderTopColor: colors.border }]}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder={t().createRecipe.chatPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.chatInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                onSubmitEditing={() => void handleSendChat()}
              />
              <Pressable
                onPress={() => void handleSendChat()}
                disabled={chatInput.trim().length === 0 || chatLoading}
                style={[
                  styles.chatSend,
                  {
                    backgroundColor: colors.primary,
                    opacity:
                      chatInput.trim().length === 0 || chatLoading ? 0.5 : 1,
                  },
                ]}
              >
                <Ionicons name="arrow-up" size={16} color={colors.primaryText} />
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    );
  };

  if (step === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {renderAppBar()}
        <View style={styles.promptBody}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.promptIcon, shadows.md]}
          >
            <ThemedText style={styles.promptSparkle}>✦</ThemedText>
          </LinearGradient>
          <View style={styles.promptHeading}>
            <ThemedText variant="title" style={styles.promptTitle}>
              {t().createRecipe.aiButton}
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.promptSubtitle}>
              {t().createRecipe.aiPromptLabel}
            </ThemedText>
          </View>
          <View style={styles.promptForm}>
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
            <Pressable
              onPress={() => void handleGenerate()}
              disabled={aiLoading || aiPrompt.trim().length === 0}
              style={({ pressed }) => [
                styles.promptCta,
                shadows.md,
                {
                  opacity:
                    aiLoading || aiPrompt.trim().length === 0
                      ? 0.5
                      : pressed
                        ? 0.85
                        : 1,
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promptCtaInner}
              >
                <ThemedText
                  variant="body"
                  style={[styles.promptCtaLabel, { color: '#FFFFFF' }]}
                >
                  {aiLoading
                    ? t().createRecipe.aiGenerating
                    : `✦  ${t().createRecipe.aiButton}`}
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
          <Pressable onPress={handleManual}>
            <ThemedText
              variant="caption"
              style={[styles.manualLink, { color: colors.textMuted }]}
            >
              {t().createRecipe.manualButton}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderStep1 = (): React.JSX.Element => (
    <ScrollView contentContainerStyle={styles.formScroll}>
      <ThemedText variant="label" muted style={styles.label}>
        {t().createRecipe.name}
      </ThemedText>
      <TextInput
        value={form.name}
        onChangeText={(v) => updateField('name', v)}
        style={fieldStyle()}
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <ThemedText variant="label" muted style={styles.label}>
            {t().createRecipe.cuisine}
          </ThemedText>
          <TextInput
            value={form.cuisine}
            onChangeText={(v) => updateField('cuisine', v)}
            style={fieldStyle()}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.rowItem}>
          <ThemedText variant="label" muted style={styles.label}>
            {t().createRecipe.difficulty}
          </ThemedText>
          <View style={[styles.difficultyRow, { borderColor: colors.inputBorder }]}>
            {DIFFICULTIES.map((d) => {
              const isActive = form.difficulty === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => updateField('difficulty', d)}
                  style={[
                    styles.difficultyBtn,
                    isActive
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: 'transparent' },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={{
                      color: isActive ? colors.primaryText : colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {d}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <ThemedText variant="label" muted style={styles.label}>
            {t().createRecipe.prepTime}
          </ThemedText>
          <TextInput
            value={form.prepTimeMinutes}
            onChangeText={(v) => updateField('prepTimeMinutes', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={fieldStyle()}
          />
        </View>
        <View style={styles.rowItem}>
          <ThemedText variant="label" muted style={styles.label}>
            {t().createRecipe.cookTime}
          </ThemedText>
          <TextInput
            value={form.cookTimeMinutes}
            onChangeText={(v) => updateField('cookTimeMinutes', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={fieldStyle()}
          />
        </View>
        <View style={styles.rowItem}>
          <ThemedText variant="label" muted style={styles.label}>
            {t().createRecipe.servings}
          </ThemedText>
          <TextInput
            value={form.servings}
            onChangeText={(v) => updateField('servings', v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={fieldStyle()}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = (): React.JSX.Element => (
    <ScrollView contentContainerStyle={styles.formScroll}>
      <ThemedText variant="label" muted style={styles.label}>
        {t().createRecipe.media}
      </ThemedText>
      <MediaPicker
        media={form.media}
        onAdd={onMediaAdd}
        onRemove={onMediaRemove}
        onSetCover={onMediaSetCover}
      />
    </ScrollView>
  );

  const renderStep3 = (): React.JSX.Element => (
    <ScrollView contentContainerStyle={styles.formScroll}>
      <ThemedText variant="label" muted style={styles.label}>
        {t().createRecipe.ingredients}
      </ThemedText>
      {form.ingredients.map((ing, i) => (
        <View key={i} style={styles.listRow}>
          <TextInput
            value={ing}
            onChangeText={(v) => updateIngredient(i, v)}
            placeholder={`${t().createRecipe.ingredients} ${i + 1}`}
            placeholderTextColor={colors.textMuted}
            style={[fieldStyle(), styles.listInput]}
          />
          <Pressable
            onPress={() => removeIngredient(i)}
            style={[styles.removeBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="close" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={addIngredient}
        style={[styles.addRowBtn, { borderColor: colors.border }]}
      >
        <Ionicons name="add" size={14} color={colors.primary} />
        <ThemedText
          variant="caption"
          style={[styles.addRowLabel, { color: colors.primary }]}
        >
          {t().createRecipe.addIngredient}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );

  const renderStep4 = (): React.JSX.Element => (
    <ScrollView contentContainerStyle={styles.formScroll}>
      <ThemedText variant="label" muted style={styles.label}>
        {t().createRecipe.instructions}
      </ThemedText>
      {form.instructions.map((instStep, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
            <ThemedText
              variant="caption"
              style={[styles.stepBadgeText, { color: colors.primaryText }]}
            >
              {i + 1}
            </ThemedText>
          </View>
          <TextInput
            value={instStep}
            onChangeText={(v) => updateInstruction(i, v)}
            multiline
            placeholder={`Step ${i + 1}`}
            placeholderTextColor={colors.textMuted}
            style={[
              fieldStyle(),
              styles.stepInput,
            ]}
          />
          <Pressable
            onPress={() => removeInstruction(i)}
            style={[styles.removeBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="close" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={addInstruction}
        style={[styles.addRowBtn, { borderColor: colors.border }]}
      >
        <Ionicons name="add" size={14} color={colors.primary} />
        <ThemedText
          variant="caption"
          style={[styles.addRowLabel, { color: colors.primary }]}
        >
          {t().createRecipe.addStep}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );

  const renderStep5 = (): React.JSX.Element => {
    const coverImage = form.media.find((m) => m.type === 'image');
    const cleanIngredients = form.ingredients.filter((s) => s.trim().length > 0);
    const cleanInstructions = form.instructions.filter((s) => s.trim().length > 0);

    return (
      <ScrollView contentContainerStyle={styles.formScroll}>
        {coverImage !== undefined ? (
          <Image
            source={{ uri: coverImage.url }}
            style={[styles.reviewImage, { borderRadius: radii.md }]}
            resizeMode="cover"
          />
        ) : null}

        <ThemedText variant="title" style={styles.reviewName}>
          {form.name.trim().length > 0 ? form.name.trim() : '—'}
        </ThemedText>

        <View style={styles.reviewChips}>
          {form.cuisine.trim().length > 0 ? (
            <View style={[styles.chip, { backgroundColor: colors.chipBackground }]}>
              <ThemedText variant="caption" style={{ color: colors.text }}>
                {form.cuisine.trim()}
              </ThemedText>
            </View>
          ) : null}
          <View style={[styles.chip, { backgroundColor: colors.chipBackground }]}>
            <ThemedText variant="caption" style={{ color: colors.text }}>
              {form.difficulty}
            </ThemedText>
          </View>
        </View>

        <View style={styles.reviewTimesRow}>
          {form.prepTimeMinutes.length > 0 ? (
            <ThemedText variant="caption" muted>
              {t().createRecipe.prepTime}: {form.prepTimeMinutes} min
            </ThemedText>
          ) : null}
          {form.cookTimeMinutes.length > 0 ? (
            <ThemedText variant="caption" muted>
              {t().createRecipe.cookTime}: {form.cookTimeMinutes} min
            </ThemedText>
          ) : null}
          {form.servings.length > 0 ? (
            <ThemedText variant="caption" muted>
              {t().createRecipe.servings}: {form.servings}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.reviewBadgesRow}>
          <View style={[styles.reviewBadge, { backgroundColor: colors.chipBackground }]}>
            <ThemedText variant="caption" style={{ color: colors.text }}>
              {cleanIngredients.length} {t().createRecipe.ingredients}
            </ThemedText>
          </View>
          <View style={[styles.reviewBadge, { backgroundColor: colors.chipBackground }]}>
            <ThemedText variant="caption" style={{ color: colors.text }}>
              {cleanInstructions.length} {t().createRecipe.stepInstructions}
            </ThemedText>
          </View>
        </View>

        {cleanIngredients.slice(0, 3).map((ing, i) => (
          <View key={i} style={styles.reviewIngredientRow}>
            <View style={[styles.reviewBullet, { backgroundColor: colors.primary }]} />
            <ThemedText variant="caption">{ing}</ThemedText>
          </View>
        ))}

        {createState.status === 'error' ? (
          <ThemedText
            variant="caption"
            style={[styles.reviewError, { color: colors.danger }]}
          >
            {t().createRecipe.saveError}
          </ThemedText>
        ) : null}

        {missingImage ? (
          <ThemedText
            variant="caption"
            style={[styles.reviewError, { color: colors.danger }]}
          >
            {t().createRecipe.noImage}
          </ThemedText>
        ) : null}
      </ScrollView>
    );
  };

  const renderCurrentStep = (): React.JSX.Element => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return renderStep5();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {renderAppBar()}
        {renderStepIndicator()}
        {renderCurrentStep()}
        {renderChatPanel()}
        {renderBottomNav()}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appBarSide: {
    minWidth: 60,
  },
  appBarSideLabel: {
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLine: {
    width: 24,
    height: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomNavBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavBtnOutline: {
    borderWidth: 1.5,
  },
  bottomNavBtnFilled: {},
  bottomNavBtnLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  promptBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  promptIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptSparkle: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  promptHeading: {
    alignItems: 'center',
  },
  promptTitle: {
    textAlign: 'center',
  },
  promptSubtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  promptForm: {
    width: '100%',
    maxWidth: 480,
  },
  promptInput: {
    minHeight: 96,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  promptCta: {
    marginTop: spacing.md,
    height: 48,
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
  },
  promptError: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  manualLink: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  formScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  label: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  difficultyRow: {
    flexDirection: 'row',
    height: 44,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  difficultyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  listInput: {
    flex: 1,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addRowLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  stepBadgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  stepInput: {
    flex: 1,
    height: 'auto',
    minHeight: 60,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  reviewImage: {
    width: '100%',
    height: 200,
    marginBottom: spacing.md,
  },
  reviewName: {
    marginBottom: spacing.sm,
  },
  reviewChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.round,
  },
  reviewTimesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  reviewBadgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  reviewIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  reviewBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reviewError: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  chatPanel: {
    borderTopWidth: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSparkle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chatHeaderBody: {
    flex: 1,
  },
  chatTitle: {
    fontWeight: '700',
  },
  chatMessages: {
    maxHeight: 200,
  },
  chatMessagesInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chatBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
  },
  thinking: {
    fontStyle: 'italic',
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderRadius: radii.round,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  chatSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
