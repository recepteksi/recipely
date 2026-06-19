import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { type SortKey, sortKeyLabels } from '@presentation/screens/recipes/recipe-sort';

export interface WebSortMenuProps {
  current: SortKey;
  /** Opens the sort picker; the parent owns the sheet + selection state. */
  onOpen: () => void;
}

/**
 * Web-only sort trigger button. Renders the current sort label and opens the
 * existing sort `BottomSheet` (owned by the parent screen) via `onOpen`.
 */
export const WebSortMenu = ({ current, onOpen }: WebSortMenuProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const labels = sortKeyLabels();
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={t().recipes.sortBy}
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
    >
      <ThemedText style={[styles.muted, { color: colors.textMuted }]}>
        {t().recipes.sortBy}:
      </ThemedText>
      <ThemedText style={[styles.value, { color: colors.text }]}>
        {labels[current]}
      </ThemedText>
      <Ionicons name="chevron-down" size={sizes.iconSm} color={colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: sizes.webSortBtn,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  muted: {
    fontSize: fontSizes.caption,
  },
  value: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
  },
});
