import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { useSeveritySurfaces } from '@presentation/base/theme/use-severity-surfaces';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const SEVERITY_ICON = {
  success: 'checkmark',
  danger: 'alert',
} as const;

export interface FeedbackDialogProps {
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
 * Centered operation-outcome dialog (a true modal alert, not a bottom sheet).
 * Shows a severity disc (✓ success / ! danger), a title and message, a
 * full-width primary button and an optional secondary text action — so neither
 * a completed nor a failed operation can ever pass silently or off-screen.
 * Cross-platform: works on web where `Alert.alert` is a no-op.
 */
export const FeedbackDialog = ({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  severity = 'success',
  secondaryLabel,
  onSecondary,
  onClose,
}: FeedbackDialogProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const surface = useSeveritySurfaces()[severity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop tap dismisses, mirroring the BottomSheet affordance. */}
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t().common.close}
        />
        <View
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: colors.background }]}
        >
          <View style={[styles.disc, { backgroundColor: surface.disc }]}>
            <Ionicons name={SEVERITY_ICON[severity]} size={sizes.iconXl} color={surface.icon} />
          </View>
          <ThemedText variant="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText variant="body" muted style={styles.message}>
            {message}
          </ThemedText>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: sizes.dialogMaxWidth,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  disc: {
    width: sizes.feedbackDisc,
    height: sizes.feedbackDisc,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primary: {
    alignSelf: 'stretch',
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontWeight: '600',
  },
  secondary: {
    alignSelf: 'stretch',
    height: sizes.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  secondaryLabel: {
    fontWeight: '600',
  },
});
