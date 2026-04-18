import { useCallback, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { StateView, type StateViewStatus } from '@presentation/base/widgets/state-view';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { recipeDetailStore } = useStores();
  const recipeState = recipeDetailStore((s) => s.byId[recipeId]);
  const load = recipeDetailStore((s) => s.load);

  useEffect(() => {
    if (recipeId.length > 0 && (recipeState === undefined || recipeState.status === 'idle')) {
      void load(recipeId);
    }
  }, [recipeId, recipeState, load]);

  const onRetry = useCallback(() => {
    if (recipeId.length > 0) {
      void load(recipeId);
    }
  }, [recipeId, load]);

  const current = recipeState ?? { status: 'loading' as const };
  const status: StateViewStatus =
    current.status === 'loading' || current.status === 'idle'
      ? 'loading'
      : current.status === 'error'
        ? 'error'
        : 'content';
  const failure: Failure | undefined = current.status === 'error' ? current.failure : undefined;

  return (
    <ScreenContainer scrollable>
      <StateView status={status} failure={failure} onRetry={onRetry}>
        {current.status === 'loaded' ? (
          <View style={styles.content}>
            <Image source={{ uri: current.recipe.image }} style={styles.image} />
            <ThemedText variant="title">{current.recipe.name}</ThemedText>

            <View style={styles.metaRow}>
              <View style={styles.chip}>
                <ThemedText variant="caption">{current.recipe.cuisine}</ThemedText>
              </View>
              <View style={styles.chip}>
                <ThemedText variant="caption">{current.recipe.difficulty}</ThemedText>
              </View>
              <View style={styles.chip}>
                <ThemedText variant="caption">
                  {current.recipe.rating.toFixed(1)} ★
                </ThemedText>
              </View>
            </View>

            <View style={styles.timeRow}>
              <ThemedText variant="body" muted>
                {t().recipes.prepTime}: {current.recipe.prepTimeMinutes} {t().recipes.minutes}
              </ThemedText>
              <ThemedText variant="body" muted>
                {t().recipes.cookTime}: {current.recipe.cookTimeMinutes} {t().recipes.minutes}
              </ThemedText>
            </View>

            {current.recipe.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {current.recipe.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <ThemedText variant="caption">{tag}</ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              {t().recipes.ingredients}
            </ThemedText>
            {current.recipe.ingredients.map((item, i) => (
              <ThemedText key={i} variant="body" style={styles.listItem}>
                •  {item}
              </ThemedText>
            ))}

            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              {t().recipes.instructions}
            </ThemedText>
            {current.recipe.instructions.map((step, i) => (
              <ThemedText key={i} variant="body" style={styles.listItem}>
                {i + 1}. {step}
              </ThemedText>
            ))}

            <View style={styles.actions}>
              <PrimaryButton
                label={t().recipes.viewTasks}
                onPress={() => router.push(`/recipes/${recipeId}/tasks`)}
              />
            </View>
          </View>
        ) : null}
      </StateView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    backgroundColor: '#8882',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: '#8881',
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listItem: {
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
