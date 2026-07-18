import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@presentation/base/widgets/sheets/bottom-sheet';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { useSeveritySurfaces } from '@presentation/base/theme/use-severity-surfaces';
import { spacing, radii, sizes } from '@presentation/base/theme';

export interface SuccessSheetProps {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  /** Optional secondary text action shown under the primary button. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
}

/**
 * Cross-platform success confirmation dialog built on {@link BottomSheet}. Shows
 * a centered ✓ disc, a title and message, a full-width primary button and an
 * optional secondary text action — the design's "operation succeeded"
 * acknowledgement so a save can never complete silently.
 */
export const SuccessSheet = ({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: SuccessSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const success = useSeveritySurfaces().success;

  return (
    <BottomSheet visible={visible} title="" onClose={onClose}>
      <View style={styles.content}>
        <View style={[styles.disc, { backgroundColor: success.disc }]}>
          <Ionicons name="checkmark" size={sizes.iconXl} color={success.icon} />
        </View>
        <ThemedText variant="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText variant="body" muted style={styles.message}>
          {message}
        </ThemedText>
      </View>
      <Pressable
        onPress={onPrimary}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        style={({ pressed }) => [
          styles.primary,
          { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <ThemedText variant="body" style={[styles.primaryLabel, { color: colors.primaryText }]}>
          {primaryLabel}
        </ThemedText>
      </Pressable>
      {secondaryLabel !== undefined && onSecondary !== undefined ? (
        <Pressable
          onPress={onSecondary}
          accessibilityRole="button"
          accessibilityLabel={secondaryLabel}
          style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.7 : 1 }]}
        >
          <ThemedText variant="body" muted style={styles.secondaryLabel}>
            {secondaryLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  disc: {
    width: sizes.successDisc,
    height: sizes.successDisc,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  primary: {
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontWeight: '600',
  },
  secondary: {
    height: sizes.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontWeight: '600',
  },
});
