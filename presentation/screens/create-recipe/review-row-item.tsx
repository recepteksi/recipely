import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { spacing, radii, type ThemeColors } from '@presentation/base/theme';

export interface ReviewRowItemProps {
  label: string;
  count: number;
  unitLabel: string;
  onPress: () => void;
  colors: ThemeColors;
}

/** Tappable summary row displaying a label, item count, and a chevron for navigation. */
export const ReviewRowItem = ({
  label,
  count,
  unitLabel,
  onPress,
  colors,
}: ReviewRowItemProps): React.JSX.Element => (
  <Pressable
    onPress={onPress}
    style={[
      styles.reviewRow,
      { backgroundColor: colors.surface, borderColor: colors.cardBorder },
    ]}
  >
    <View style={styles.reviewRowBody}>
      <ThemedText variant="body" style={styles.reviewRowLabel}>
        {label}
      </ThemedText>
      <ThemedText variant="caption" muted style={styles.reviewRowCount}>
        {count} {unitLabel}
      </ThemedText>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
  </Pressable>
);

const styles = StyleSheet.create({
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  reviewRowBody: {
    flexShrink: 1,
  },
  reviewRowLabel: {
    fontWeight: '600',
  },
  reviewRowCount: {
    marginTop: 2,
  },
});
