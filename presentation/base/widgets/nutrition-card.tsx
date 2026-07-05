import { StyleSheet, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeNutrition } from '@domain/recipes/recipe-nutrition';
import { NutritionTile } from '@presentation/base/widgets/nutrition-tile';
import type { TileProps } from '@presentation/base/widgets/nutrition-tile';

export interface NutritionCardProps {
  caloriesPerServing: number;
  servings: number;
  nutrition?: RecipeNutrition;
}

/** Displays per-serving macros (calories, protein, carbs, fat, fiber) from the recipe. */
export const NutritionCard = ({ caloriesPerServing, servings, nutrition }: NutritionCardProps): React.JSX.Element | null => {
  const { colors } = useTheme();
  const strings = t().nutrition;

  const hasData =
    caloriesPerServing > 0 ||
    (nutrition?.protein ?? 0) > 0 ||
    (nutrition?.carbs ?? 0) > 0 ||
    (nutrition?.fat ?? 0) > 0 ||
    (nutrition?.fiber ?? 0) > 0;

  if (!hasData) return null;

  const tiles: TileProps[] = [
    {
      label: strings.calories,
      value: caloriesPerServing,
      unit: strings.kcal,
      tileColor: colors.primaryLight,
      valueColor: colors.primary,
      labelColor: colors.textMuted,
    },
    {
      label: strings.protein,
      value: nutrition?.protein ?? 0,
      unit: strings.g,
      tileColor: colors.chipBackground,
      valueColor: colors.text,
      labelColor: colors.textMuted,
    },
    {
      label: strings.carbs,
      value: nutrition?.carbs ?? 0,
      unit: strings.g,
      tileColor: colors.chipBackground,
      valueColor: colors.text,
      labelColor: colors.textMuted,
    },
    {
      label: strings.fat,
      value: nutrition?.fat ?? 0,
      unit: strings.g,
      tileColor: colors.chipBackground,
      valueColor: colors.text,
      labelColor: colors.textMuted,
    },
  ];

  const fiberValue = nutrition?.fiber ?? 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <ThemedText variant="label" style={styles.title}>{strings.title}</ThemedText>
        <ThemedText variant="caption" muted>
          {`${String(servings)} ${strings.perServing}`}
        </ThemedText>
      </View>
      <View style={styles.tilesRow}>
        {tiles.map((tile) => (
          <NutritionTile key={tile.label} {...tile} />
        ))}
      </View>
      {fiberValue > 0 ? (
        <View style={[styles.fiberRow, { borderTopColor: colors.border }]}>
          <ThemedText variant="caption" style={{ color: colors.text }}>
            {strings.fiberValue.replace('{value}', String(fiberValue))}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '600' as const,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fiberRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
