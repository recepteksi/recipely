import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { TimeCard } from '@presentation/base/widgets/time-card';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
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

interface InfoStatProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

const InfoStat = ({ icon, value, label }: InfoStatProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={styles.stat}>
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={sizes.iconXxs} color={colors.primary} />
      </View>
      <ThemedText style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText variant="label" muted style={styles.statLabel} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
};

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
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  badge: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSizes.heading,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSizes.micro,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
