import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { HERO_SAVE_BG } from '@presentation/app/recipes/model/web-hero-constants';
import { ValueConstants } from '@core/constants';

export interface WebHeroActionRowProps {
  onView: () => void;
  /** When provided, renders the cosmetic frosted "Save" button. */
  onSave?: () => void;
  savedByMe?: boolean;
}

/** Hero featured-card button row: "View recipe" + optional frosted "Save". */
export const WebHeroActionRow = ({
  onView,
  onSave,
  savedByMe = false,
}: WebHeroActionRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onView}
        accessibilityRole="button"
        accessibilityLabel={t().recipes.viewRecipe}
        style={[styles.viewBtn, { backgroundColor: colors.onOverlay }]}
      >
        <ThemedText style={[styles.label, { color: colors.heroButtonText }]}>
          {t().recipes.viewRecipe}
        </ThemedText>
      </Pressable>
      {onSave !== undefined ? (
        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel={savedByMe ? t().recipes.saved : t().recipes.save}
          style={[styles.saveBtn, { backgroundColor: HERO_SAVE_BG, borderColor: colors.onOverlay }]}
        >
          <ThemedText style={[styles.label, { color: colors.onOverlay }]}>
            {savedByMe ? t().recipes.saved : t().recipes.save}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs2,
  },
  viewBtn: {
    height: sizes.heroActionBtn,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    height: sizes.heroActionBtn,
    borderRadius: radii.lg,
    borderWidth: ValueConstants.one,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
});
