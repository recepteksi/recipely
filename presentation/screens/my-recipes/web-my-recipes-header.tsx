import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface WebMyRecipesHeaderProps {
  onCreate: () => void;
}

/** Web My Recipes header band: h1 title + muted subtitle + "Create recipe" CTA. */
export const WebMyRecipesHeader = ({ onCreate }: WebMyRecipesHeaderProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={[styles.band, { borderBottomColor: colors.border }]}>
      <View style={styles.text}>
        <ThemedText accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {t().myRecipes.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
          {t().myRecipes.webSubtitle}
        </ThemedText>
      </View>
      <Pressable
        onPress={onCreate}
        accessibilityRole="button"
        accessibilityLabel={t().myRecipes.createNew}
        style={({ pressed }) => [
          styles.createBtn,
          shadows.sm,
          { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <Ionicons name="add" size={sizes.iconMd} color={colors.primaryText} />
        <ThemedText style={[styles.createLabel, { color: colors.primaryText }]}>
          {t().myRecipes.createNew}
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '800',
    fontSize: fontSizes.headline,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSizes.medium,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: sizes.heroActionBtn,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    flexShrink: 0,
  },
  createLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
});
