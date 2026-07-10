import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

const CHANNEL_CHIP_SIZE = 44;

export interface ChannelTileProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}

/** A single share-channel tile: a round icon chip above a label. */
export const ChannelTile = ({ icon, label, onPress }: ChannelTileProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.channelTile,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.channelChip, { backgroundColor: colors.chipBackground }]}>
        <Ionicons name={icon} size={sizes.iconMd} color={colors.primary} />
      </View>
      <ThemedText variant="caption" style={styles.channelLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  channelTile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  channelChip: {
    width: CHANNEL_CHIP_SIZE,
    height: CHANNEL_CHIP_SIZE,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelLabel: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});
