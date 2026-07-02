import { StyleSheet, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { spacing, radii, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeNutrition } from '@domain/recipes/recipe-nutrition';

export interface NutritionCardProps {
  caloriesPerServing: number;
  servings: number;
  nutrition?: RecipeNutrition;
}

interface TileProps {
  label: string;
  value: number;
  unit: string;
  tileColor: string;
  valueColor: string;
  labelColor: string;
}

const NutritionTile = ({ label, value, unit, tileColor, valueColor, labelColor }: TileProps): React.JSX.Element => (
  <View style={[styles.tile, { backgroundColor: tileColor }]}>
    <View style={styles.tileValueRow}>
      <ThemedText style={[styles.tileValue, { color: valueColor }]}>{String(value)}</ThemedText>
      <ThemedText style={[styles.tileUnit, { color: labelColor }]}>{unit}</ThemedText>
    </View>
    <ThemedText style={[styles.tileLabel, { color: labelColor }]}>{label}</ThemedText>
  </View>
);

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
          <ThemedText variant="caption" muted>{strings.fiber}</ThemedText>
          <ThemedText variant="caption" style={{ color: colors.text }}>
            {`${String(fiberValue)} ${strings.g}`}
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
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  tileValue: {
    fontSize: fontSizes.heading,
    fontWeight: '700' as const,
    lineHeight: fontSizes.heading + 4,
  },
  tileUnit: {
    fontSize: fontSizes.micro,
    lineHeight: fontSizes.heading + 4,
    paddingBottom: 1,
  },
  tileLabel: {
    fontSize: fontSizes.micro,
    marginTop: spacing.xxs,
  },
  fiberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
