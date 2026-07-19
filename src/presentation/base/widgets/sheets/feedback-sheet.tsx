import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@presentation/base/widgets/sheets/bottom-sheet';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { useSeveritySurfaces } from '@presentation/base/theme/use-severity-surfaces';
import { spacing, radii, sizes } from '@presentation/base/theme';

const SEVERITY_ICON = {
  success: 'checkmark',
  danger: 'alert',
} as const;

export interface FeedbackSheetProps {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  /** Visual tone of the disc + icon; success by default. */
  severity?: 'success' | 'danger';
  /** Optional secondary text action shown under the primary button. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
}

/**
 * Cross-platform operation-outcome dialog built on {@link BottomSheet}. Shows a
 * centered severity disc (✓ success / ! danger), a title and message, a
 * full-width primary button and an optional secondary text action — so neither
 * a completed nor a failed operation can ever pass silently or off-screen.
 */
export const FeedbackSheet = ({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  severity = 'success',
  secondaryLabel,
  onSecondary,
  onClose,
}: FeedbackSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const surface = useSeveritySurfaces()[severity];

  return (
    <BottomSheet visible={visible} title="" onClose={onClose}>
      <View style={styles.content}>
        <View style={[styles.disc, { backgroundColor: surface.disc }]}>
          <Ionicons name={SEVERITY_ICON[severity]} size={sizes.iconXl} color={surface.icon} />
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
    width: sizes.feedbackDisc,
    height: sizes.feedbackDisc,
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
