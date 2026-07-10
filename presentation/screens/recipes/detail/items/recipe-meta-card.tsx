import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { TimeCard } from '@presentation/screens/recipes/detail/items/time-card';
import { InfoStat } from '@presentation/screens/recipes/detail/items/info-stat';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { Difficulty } from '@domain/recipes/difficulty';

export interface RecipeMetaCardProps {
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  recipeId: string;
  recipeName: string;
}

/**
 * Unified rounded meta card for the mobile recipe detail screen: a single row of
 * equal-flex segments separated by hairline vertical dividers. Prep/cook segments
 * reuse `TimeCard` in `segment` mode (countdown behaviour preserved); serves and
 * difficulty are static stats. Time segments render only when their minutes > 0.
 */
export const RecipeMetaCard = ({
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  difficulty,
  recipeId,
  recipeName,
}: RecipeMetaCardProps): React.JSX.Element => {
  const colors = useTheme().colors;

  const segments: { key: string; node: React.JSX.Element }[] = [];

  if (prepTimeMinutes > 0) {
    segments.push({
      key: 'prep',
      node: (
        <TimeCard
          segment
          label={t().recipes.prepTime}
          minutes={prepTimeMinutes}
          iconName="time-outline"
          recipeId={recipeId}
          recipeName={recipeName}
          slot="prep"
        />
      ),
    });
  }
  if (cookTimeMinutes > 0) {
    segments.push({
      key: 'cook',
      node: (
        <TimeCard
          segment
          label={t().recipes.cookTime}
          minutes={cookTimeMinutes}
          iconName="flame-outline"
          recipeId={recipeId}
          recipeName={recipeName}
          slot="cook"
        />
      ),
    });
  }
  segments.push({
    key: 'serves',
    node: <InfoStat icon="people-outline" value={String(servings)} label={t().recipes.servings} />,
  });
  segments.push({
    key: 'level',
    node: <InfoStat icon="speedometer-outline" value={difficulty} label={t().recipes.difficulty} />,
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      {segments.map((seg, i) => (
        <Fragment key={seg.key}>
          {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          {seg.node}
        </Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: sizes.inputBorderWidth,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: spacing.lg,
  },
});
