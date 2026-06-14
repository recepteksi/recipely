import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

export interface SelectTileProps {
  label: string;
  emoji: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
}

/**
 * A tappable surface card showing a small uppercase label, the selected
 * emoji + value (or a muted placeholder when unset), and a chevron hint that
 * opens a picker sheet. Two tiles typically sit side-by-side in a row.
 */
export const SelectTile = ({
  label,
  emoji,
  value,
  placeholder,
  onPress,
}: SelectTileProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const hasValue = value !== null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ?? placeholder}`}
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
    >
      <ThemedText variant="caption" style={[styles.label, { color: colors.textMuted }]}>
        {label.toUpperCase()}
      </ThemedText>
      <View style={styles.valueRow}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        <ThemedText
          variant="body"
          numberOfLines={1}
          style={[styles.value, { color: hasValue ? colors.text : colors.textMuted }]}
        >
          {value ?? placeholder}
        </ThemedText>
        <Ionicons name="chevron-forward" size={sizes.iconSm} color={colors.textMuted} style={styles.chevron} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.nano,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
  },
  emoji: {
    fontSize: fontSizes.subtitle,
  },
  value: {
    flex: 1,
    fontWeight: '700',
  },
  chevron: {
    transform: [{ rotate: '90deg' }],
  },
});
