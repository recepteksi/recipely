import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { MediaGallery } from '@presentation/base/widgets/media-gallery';
import { VideoSection } from '@presentation/base/widgets/video-section';
import { TimeCard } from '@presentation/base/widgets/time-card';
import { IngredientCard } from '@presentation/base/widgets/ingredient-card';
import { InstructionCard } from '@presentation/base/widgets/instruction-card';
import {
  StateView,
  type StateViewStatus,
} from '@presentation/base/widgets/state-view';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { MediaItem } from '@domain/recipes/media-item';

interface InfoChipProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  iconColor?: string;
  chipBg: string;
  chipTextColor: string;
}

const InfoChip = ({
  icon,
  label,
  iconColor,
  chipBg,
  chipTextColor,
}: InfoChipProps): React.JSX.Element => (
  <View style={[styles.chip, { backgroundColor: chipBg }]}>
    <MaterialCommunityIcons
      name={icon}
      size={14}
      color={iconColor ?? chipTextColor}
      style={styles.chipIcon}
    />
    <ThemedText variant="caption" style={{ color: chipTextColor }}>
      {label}
    </ThemedText>
  </View>
);

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { recipeDetailStore, savedRecipesStore, createdRecipesStore } = useStores();
  const networkState = recipeDetailStore((s) => s.byId[recipeId]);
  const load = recipeDetailStore((s) => s.load);
  const localRecipe = createdRecipesStore((s) => s.findById(recipeId));
  const isSaved = savedRecipesStore((s) => s.savedIds.has(recipeId));
  const toggleSaved = savedRecipesStore((s) => s.toggle);

  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  // Local (user-created) recipes short-circuit the network store entirely.
  const isLocal = localRecipe !== undefined;
  const recipeState =
    localRecipe !== undefined
      ? ({ status: 'loaded' as const, recipe: localRecipe })
      : networkState;

  useEffect(() => {
    if (
      !isLocal &&
      recipeId.length > 0 &&
      (networkState === undefined || networkState.status === 'idle')
    ) {
      void load(recipeId);
    }
  }, [isLocal, recipeId, networkState, load]);

  const ingredientCount =
    recipeState?.status === 'loaded' ? recipeState.recipe.ingredients.length : 0;
  const instructionCount =
    recipeState?.status === 'loaded' ? recipeState.recipe.instructions.length : 0;

  useEffect(() => {
    if (ingredientCount > 0) {
      setCheckedIngredients(new Array(ingredientCount).fill(false) as boolean[]);
    }
  }, [ingredientCount]);

  useEffect(() => {
    if (instructionCount > 0) {
      setCompletedSteps(new Array(instructionCount).fill(false) as boolean[]);
    }
  }, [instructionCount]);

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

  const toggleStep = useCallback((index: number) => {
    setCompletedSteps((prev) => {
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
  const failure: Failure | undefined =
    current.status === 'error' ? current.failure : undefined;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <StateView status={status} failure={failure} onRetry={onRetry}>
          {current.status === 'loaded' ? (
            (() => {
              const recipe = current.recipe;
              const media: readonly MediaItem[] =
                recipe.media.length > 0
                  ? recipe.media
                  : [{ type: 'image', url: recipe.image }];
              const videos = media.filter((m) => m.type === 'video');

              return (
                <View>
                  <MediaGallery media={media} />

                  <View
                    style={[
                      styles.content,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <ThemedText variant="title">{recipe.name}</ThemedText>

                    <View style={styles.chipsRow}>
                      <InfoChip
                        icon="earth"
                        label={recipe.cuisine}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                      <InfoChip
                        icon="speedometer"
                        label={recipe.difficulty}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                      <InfoChip
                        icon="star"
                        label={recipe.rating.toFixed(1)}
                        iconColor={colors.starFilled}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                    </View>

                    <View style={styles.timeRow}>
                      <TimeCard
                        label={t().recipes.prepTime}
                        minutes={recipe.prepTimeMinutes}
                        iconName="time-outline"
                      />
                      <TimeCard
                        label={t().recipes.cookTime}
                        minutes={recipe.cookTimeMinutes}
                        iconName="flame-outline"
                      />
                    </View>

                    {recipe.tags.length > 0 ? (
                      <View style={styles.tagsRow}>
                        {recipe.tags.map((tag) => (
                          <View
                            key={tag}
                            style={[
                              styles.tag,
                              { backgroundColor: colors.chipBackground },
                            ]}
                          >
                            <ThemedText
                              variant="caption"
                              style={{ color: colors.chipText }}
                            >
                              {tag}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {videos.length > 0 ? (
                      <>
                        <SectionHeader title={t().recipes.videos} />
                        <VideoSection videos={videos} />
                      </>
                    ) : null}

                    <SectionHeader title={t().recipes.ingredients} />
                    <View style={styles.cardsList}>
                      {recipe.ingredients.map((item, i) => (
                        <IngredientCard
                          key={i}
                          raw={item}
                          checked={checkedIngredients[i] ?? false}
                          onToggle={() => toggleIngredient(i)}
                        />
                      ))}
                    </View>

                    <SectionHeader title={t().recipes.instructions} />
                    <View style={styles.cardsList}>
                      {recipe.instructions.map((step, i) => (
                        <InstructionCard
                          key={i}
                          index={i}
                          step={step}
                          completed={completedSteps[i] ?? false}
                          onToggle={() => toggleStep(i)}
                        />
                      ))}
                    </View>

                    <View style={styles.actions}>
                      <PrimaryButton
                        label={t().recipes.viewTasks}
                        onPress={() =>
                          router.push({
                            pathname: '/recipes/[recipeId]/tasks',
                            params: { recipeId },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              );
            })()
          ) : null}
        </StateView>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </Pressable>

      {current.status === 'loaded' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isSaved }}
          onPress={() => toggleSaved(recipeId)}
          style={[styles.saveButton, { top: insets.top + 8 }]}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    marginTop: -spacing.xxl,
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
    marginTop: spacing.md,
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
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  cardsList: {
    gap: spacing.sm,
  },
  actions: {
    marginTop: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
