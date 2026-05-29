import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t, getLocale } from '@presentation/i18n';
import type { Recipe } from '@domain/recipes/recipe';

interface AiRecipeView {
  name: string;
  cuisine: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  image: string;
  ingredientCount: number;
}

const toView = (recipe: Recipe): AiRecipeView => ({
  name: recipe.name,
  cuisine: String(recipe.cuisine),
  difficulty: String(recipe.difficulty),
  prepTimeMinutes: recipe.prepTimeMinutes,
  cookTimeMinutes: recipe.cookTimeMinutes,
  servings: recipe.servings,
  caloriesPerServing: recipe.caloriesPerServing,
  image: recipe.image,
  ingredientCount: recipe.ingredients.length,
});

export const AIGenerateScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();

  const { createdRecipesStore } = useStores();
  const generateState = createdRecipesStore((s) => s.generateState);
  const generateRecipe = createdRecipesStore((s) => s.generateRecipe);
  const resetGenerateState = createdRecipesStore((s) => s.resetGenerateState);

  const [prompt, setPrompt] = useState('');

  const spin = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  const status: 'idle' | 'thinking' | 'result' | 'error' =
    generateState.status === 'generating'
      ? 'thinking'
      : generateState.status === 'success'
        ? 'result'
        : generateState.status === 'error'
          ? 'error'
          : 'idle';

  const result: AiRecipeView | null =
    generateState.status === 'success' ? toView(generateState.recipe) : null;
  const refining = generateState.status === 'generating' && result !== null;
  const generateError =
    generateState.status === 'error' ? generateState.failure.message : null;

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [spin]);

  useEffect(() => {
    if (generateState.status === 'generating') {
      progressWidth.value = withTiming(1, { duration: 2000 });
    } else if (generateState.status !== 'success') {
      progressWidth.value = 0;
    }
  }, [generateState.status, progressWidth]);

  useEffect(() => {
    return () => { resetGenerateState(); };
  }, [resetGenerateState]);

  const generate = (text: string): void => {
    if (text.trim().length === 0) return;
    void generateRecipe(text.trim(), getLocale());
  };

  const refine = (instruction: string): void => {
    const refined = `${instruction}: ${prompt.trim()}`.trim();
    if (refined.length === 0) return;
    void generateRecipe(refined, getLocale());
  };

  const openDraftInWizard = (): void => {
    router.replace('/create-recipe');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ResponsiveContainer route="aiGenerate" gutter={false} fill>
      <View style={[styles.header, { paddingTop: isWebShell ? spacing.md : insets.top + spacing.sm, borderBottomColor: colors.cardBorder }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.chipBackground }]}
          accessibilityRole="button"
          accessibilityLabel={t().ai.title}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.headerTitle}>
          {t().ai.title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <HeroCard />

        <PromptCard
          prompt={prompt}
          onChangePrompt={setPrompt}
          onGenerate={() => generate(prompt)}
          loading={status === 'thinking'}
        />

        {status === 'idle' && (
          <SamplePrompts onSelect={(p) => { setPrompt(p); generate(p); }} />
        )}

        {status === 'thinking' && (
          <ThinkingView spinValue={spin} progressValue={progressWidth} />
        )}

        {status === 'result' && result !== null && (
          <ResultView
            recipe={result}
            refining={refining}
            onRefine={refine}
            onRegenerate={() => generate(prompt)}
            onSave={openDraftInWizard}
          />
        )}

        {status === 'error' && generateError !== null && (
          <View style={[styles.thinkingSection]}>
            <ThemedText variant="body" style={{ color: colors.danger, textAlign: 'center' }}>
              {generateError}
            </ThemedText>
            <Pressable
              onPress={() => generate(prompt)}
              style={[styles.outlineBtn, { borderColor: colors.primary, marginTop: spacing.md }]}
              accessibilityRole="button"
              accessibilityLabel={t().common.retry}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <ThemedText variant="caption" style={[styles.outlineBtnLabel, { color: colors.primary }]}>
                {t().common.retry}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
      </ResponsiveContainer>
    </View>
  );
};

const HeroCard = (): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <Ionicons
        name="sparkles"
        size={80}
        color={colors.onOverlay}
        style={styles.heroBgIcon}
      />
      <View style={[styles.heroBadge, { backgroundColor: colors.gradientSurface }]}>
        <Ionicons name="sparkles" size={14} color={colors.onOverlay} />
      </View>
      <ThemedText variant="caption" style={[styles.poweredBy, { color: colors.onOverlay }]}>
        {t().ai.poweredBy.toUpperCase()}
      </ThemedText>
      <ThemedText variant="subtitle" style={[styles.heroTitle, { color: colors.onOverlay }]}>
        {t().ai.heroTitle}
      </ThemedText>
      <ThemedText variant="body" style={[styles.heroSub, { color: colors.onOverlay }]}>
        {t().ai.heroSub}
      </ThemedText>
    </LinearGradient>
  );
};

interface PromptCardProps {
  prompt: string;
  onChangePrompt: (v: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

const PromptCard = ({ prompt, onChangePrompt, onGenerate, loading }: PromptCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const canGenerate = prompt.trim().length > 0 && !loading;
  return (
    <View
      style={[
        styles.promptCard,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
        shadows.sm,
      ]}
    >
      <TextInput
        style={[styles.promptInput, { color: colors.text }]}
        placeholder={t().ai.promptPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={prompt}
        onChangeText={(v) => onChangePrompt(v.slice(0, 240))}
        multiline
        numberOfLines={3}
      />
      <View style={styles.promptFooter}>
        <ThemedText variant="caption" muted>
          {prompt.length}/240
        </ThemedText>
        <Pressable
          onPress={onGenerate}
          disabled={!canGenerate}
          style={({ pressed }) => [
            styles.generateBtn,
            {
              backgroundColor: canGenerate ? colors.primary : colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t().ai.generate}
        >
          <Ionicons name="sparkles" size={14} color={canGenerate ? colors.primaryText : colors.textMuted} />
          <ThemedText
            variant="caption"
            style={[styles.generateLabel, { color: canGenerate ? colors.primaryText : colors.textMuted }]}
          >
            {loading ? t().ai.thinking : t().ai.generate}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

interface SamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const SamplePrompts = ({ onSelect }: SamplePromptsProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const samples = t().createRecipe.ideaChips;
  return (
    <View style={styles.samplesSection}>
      <ThemedText variant="caption" muted style={styles.samplesLabel}>
        {t().ai.try}
      </ThemedText>
      {samples.map((p) => (
        <Pressable
          key={p}
          onPress={() => onSelect(p)}
          style={({ pressed }) => [
            styles.sampleRow,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, opacity: pressed ? 0.75 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={p}
        >
          <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
          <ThemedText variant="body" style={styles.sampleText} numberOfLines={1}>
            {p}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      ))}
    </View>
  );
};

interface ThinkingViewProps {
  spinValue: SharedValue<number>;
  progressValue: SharedValue<number>;
}

const ThinkingView = ({ spinValue, progressValue }: ThinkingViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%` as `${number}%`,
  }));
  return (
    <View style={styles.thinkingSection}>
      <Animated.View style={[styles.spinRing, { borderColor: colors.primary }, spinStyle]}>
        <Ionicons name="sparkles" size={28} color={colors.primary} />
      </Animated.View>
      <ThemedText variant="subtitle" style={styles.thinkingTitle}>
        {t().ai.cooking}
      </ThemedText>
      <ThemedText variant="body" muted style={styles.thinkingSub}>
        {t().ai.cookingSub}
      </ThemedText>
      <View style={[styles.progressTrack, { backgroundColor: colors.chipBackground }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.primary }, progressStyle]} />
      </View>
    </View>
  );
};

interface ResultViewProps {
  recipe: AiRecipeView;
  refining: boolean;
  onRefine: (instruction: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
}

const ResultView = ({ recipe, refining, onRefine, onRegenerate, onSave }: ResultViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const refineChips = [
    t().ai.makeVegan,
    t().ai.faster,
    t().ai.lessCalories,
    t().ai.spicier,
    t().ai.glutenFree,
  ];
  return (
    <View style={styles.resultSection}>
      <View style={[styles.readyChip, { backgroundColor: colors.successLight }]}>
        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
        <ThemedText variant="caption" style={[styles.readyText, { color: colors.success }]}>
          {t().ai.ready}
        </ThemedText>
      </View>

      <View
        style={[
          styles.recipeCard,
          { borderColor: colors.primary, backgroundColor: colors.cardBackground },
          shadows.sm,
        ]}
      >
        <Image
          source={{ uri: recipe.image }}
          style={styles.recipeImage}
          contentFit="cover"
        />
        <View style={styles.recipeInfo}>
          <ThemedText variant="subtitle" style={styles.recipeName} numberOfLines={2}>
            {recipe.name}
          </ThemedText>
          <View style={styles.chipRow}>
            {[recipe.cuisine, recipe.difficulty, `${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min`, `${recipe.servings} serv`].map((chip) => (
              <View key={chip} style={[styles.infoChip, { backgroundColor: colors.chipBackground }]}>
                <ThemedText variant="caption" style={{ color: colors.chipText, fontSize: fontSizes.small }}>
                  {chip}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText variant="caption" muted>
            {recipe.ingredientCount} {t().ai.ingredients} · {recipe.caloriesPerServing} kcal
          </ThemedText>
        </View>
      </View>

      <ThemedText variant="caption" muted style={styles.refineLabel}>
        {t().ai.refine}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.refineRow}
      >
        {refineChips.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => onRefine(chip)}
            disabled={refining}
            style={({ pressed }) => [
              styles.refineChip,
              { borderColor: colors.primary, backgroundColor: colors.chipBackground, opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={chip}
          >
            <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              {refining ? t().ai.refining : chip}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actionRow}>
        <Pressable
          onPress={onRegenerate}
          style={[styles.outlineBtn, { borderColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t().ai.regenerate}
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <ThemedText variant="caption" style={[styles.outlineBtnLabel, { color: colors.primary }]}>
            {t().ai.regenerate}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={onSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t().ai.save}
        >
          <ThemedText variant="caption" style={[styles.saveBtnLabel, { color: colors.primaryText }]}>
            {t().ai.save}
          </ThemedText>
        </Pressable>
      </View>

      <Pressable
        onPress={() => {}}
        style={styles.previewLink}
        accessibilityRole="button"
        accessibilityLabel={t().ai.preview}
      >
        <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          {t().ai.preview} →
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  headerSpacer: { width: sizes.iconBtn },
  content: { padding: spacing.lg, gap: spacing.lg },
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    opacity: 0.15,
  },
  heroBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  poweredBy: {
    fontSize: fontSizes.micro,
    letterSpacing: 0.5,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  heroTitle: { fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
  heroSub: { opacity: 0.85, color: '#FFFFFF', lineHeight: 20 },
  promptCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  promptInput: {
    fontSize: fontSizes.body,
    minHeight: sizes.textAreaMin,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  promptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    height: sizes.chipHeight,
  },
  generateLabel: { fontWeight: '600' },
  samplesSection: { gap: spacing.sm },
  samplesLabel: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  sampleText: { flex: 1, fontWeight: '500' },
  thinkingSection: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  spinRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingTitle: { fontWeight: '700', textAlign: 'center' },
  thinkingSub: { textAlign: 'center', paddingHorizontal: spacing.xl },
  progressTrack: {
    width: '60%',
    height: 4,
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: radii.round },
  resultSection: { gap: spacing.md },
  readyChip: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
  },
  readyText: { fontWeight: '600', fontSize: fontSizes.small },
  recipeCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 160,
  },
  recipeInfo: { padding: spacing.md, gap: spacing.sm },
  recipeName: { fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  infoChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.round,
  },
  refineLabel: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  refineRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  refineChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
    height: sizes.chipHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: sizes.floatingBtn,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  outlineBtnLabel: { fontWeight: '600' },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: sizes.floatingBtn,
    borderRadius: radii.lg,
  },
  saveBtnLabel: { fontWeight: '700' },
  previewLink: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
});
