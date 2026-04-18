import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { CheckboxItem } from '@presentation/base/widgets/checkbox-item';
import { StateView, type StateViewStatus } from '@presentation/base/widgets/state-view';
import { pickColors } from '@presentation/base/theme/colors';
import { t } from '@presentation/i18n';
import { spacing, radii, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

interface InfoChipProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  iconColor?: string;
  chipBg: string;
  chipTextColor: string;
}

const InfoChip = ({ icon, label, iconColor, chipBg, chipTextColor }: InfoChipProps): React.JSX.Element => (
  <View style={[styles.chip, { backgroundColor: chipBg }]}>
    <MaterialCommunityIcons name={icon} size={14} color={iconColor ?? chipTextColor} style={styles.chipIcon} />
    <ThemedText variant="caption" style={{ color: chipTextColor }}>{label}</ThemedText>
  </View>
);

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = pickColors(colorScheme);
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { recipeDetailStore } = useStores();
  const recipeState = recipeDetailStore((s) => s.byId[recipeId]);
  const load = recipeDetailStore((s) => s.load);

  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);

  useEffect(() => {
    if (recipeId.length > 0 && (recipeState === undefined || recipeState.status === 'idle')) {
      void load(recipeId);
    }
  }, [recipeId, recipeState, load]);

  const ingredientCount =
    recipeState?.status === 'loaded' ? recipeState.recipe.ingredients.length : 0;

  useEffect(() => {
    if (ingredientCount > 0) {
      setCheckedIngredients(new Array(ingredientCount).fill(false) as boolean[]);
    }
  }, [ingredientCount]);

  const onRetry = useCallback(() => {
    if (recipeId.length > 0) {
      void load(recipeId);
    }
  }, [recipeId, load]);

  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const current = recipeState ?? { status: 'loading' as const };
  const status: StateViewStatus =
    current.status === 'loading' || current.status === 'idle'
      ? 'loading'
      : current.status === 'error'
        ? 'error'
        : 'content';
  const failure: Failure | undefined = current.status === 'error' ? current.failure : undefined;

  return (
    <ScreenContainer scrollable padded={false}>
      <StateView status={status} failure={failure} onRetry={onRetry}>
        {current.status === 'loaded' ? (
          <View style={styles.root}>
            <Image source={{ uri: current.recipe.image }} style={styles.heroImage} />

            <View style={[styles.content, { backgroundColor: colors.background }]}>
              <ThemedText variant="title">{current.recipe.name}</ThemedText>

              <View style={styles.chipsRow}>
                <InfoChip
                  icon="earth"
                  label={current.recipe.cuisine}
                  chipBg={colors.chipBackground}
                  chipTextColor={colors.chipText}
                />
                <InfoChip
                  icon="speedometer"
                  label={current.recipe.difficulty}
                  chipBg={colors.chipBackground}
                  chipTextColor={colors.chipText}
                />
                <InfoChip
                  icon="clock-outline"
                  label={`${current.recipe.prepTimeMinutes} ${t().recipes.minutes}`}
                  chipBg={colors.chipBackground}
                  chipTextColor={colors.chipText}
                />
                <InfoChip
                  icon="fire"
                  label={`${current.recipe.cookTimeMinutes} ${t().recipes.minutes}`}
                  chipBg={colors.chipBackground}
                  chipTextColor={colors.chipText}
                />
                <InfoChip
                  icon="star"
                  label={current.recipe.rating.toFixed(1)}
                  iconColor={colors.starFilled}
                  chipBg={colors.chipBackground}
                  chipTextColor={colors.chipText}
                />
              </View>

              {current.recipe.tags.length > 0 ? (
                <View style={styles.tagsRow}>
                  {current.recipe.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.chipBackground }]}>
                      <ThemedText variant="caption" style={{ color: colors.chipText }}>
                        {tag}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}

              <SectionHeader title={t().recipes.ingredients} />
              {current.recipe.ingredients.map((item, i) => (
                <CheckboxItem
                  key={i}
                  label={item}
                  checked={checkedIngredients[i] ?? false}
                  onToggle={() => toggleIngredient(i)}
                />
              ))}

              <SectionHeader title={t().recipes.instructions} />
              {current.recipe.instructions.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepCircle, { backgroundColor: colors.primary }]}>
                    <ThemedText variant="caption" style={[styles.stepNumber, { color: colors.primaryText }]}>
                      {i + 1}
                    </ThemedText>
                  </View>
                  <ThemedText variant="body" style={styles.stepText}>{step}</ThemedText>
                </View>
              ))}

              <View style={styles.actions}>
                <PrimaryButton
                  label={t().recipes.viewTasks}
                  onPress={() => router.push(`/recipes/${recipeId}/tasks`)}
                />
              </View>
            </View>
          </View>
        ) : null}
      </StateView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: sizes.heroImageHeight,
    resizeMode: 'cover',
  },
  content: {
    marginTop: -32,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.round,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipIcon: {
    marginRight: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepNumber: {
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
