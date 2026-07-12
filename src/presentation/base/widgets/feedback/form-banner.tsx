import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useSeveritySurfaces } from '@presentation/base/theme/use-severity-surfaces';
import type { Severity } from '@presentation/base/theme/severity';
import { spacing, radii, sizes } from '@presentation/base/theme';

const SEVERITY_ICON: Record<Severity, keyof typeof Ionicons.glyphMap> = {
  danger: 'alert-circle',
  warning: 'warning',
  success: 'checkmark-circle',
  neutral: 'information-circle',
};

export interface FormBannerProps {
  message: string;
  severity?: Severity;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * A message banner pinned above a form — the design's mechanism for a rejected
 * submission that belongs to the whole form, not one field (e.g. "Couldn't sign
 * in. Email or password is wrong."). Severity-tinted; danger by default.
 */
export const FormBanner = ({
  message,
  severity = 'danger',
  icon,
}: FormBannerProps): React.JSX.Element => {
  const surface = useSeveritySurfaces()[severity];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: surface.bg, borderColor: surface.border }]}
    >
      <Ionicons name={icon ?? SEVERITY_ICON[severity]} size={sizes.iconXxs} color={surface.icon} />
      <ThemedText variant="caption" style={[styles.message, { color: surface.text }]}>
        {message}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  message: {
    flex: 1,
    fontWeight: '600',
  },
});
