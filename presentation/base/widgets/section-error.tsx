import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useSeveritySurfaces } from '@presentation/base/theme/use-severity-surfaces';
import type { Severity } from '@presentation/base/theme/severity';
import { spacing, radii, sizes } from '@presentation/base/theme';

const DISC_SIZE = 52;

export interface SectionErrorProps {
  severity?: Severity;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * A failed block inside an otherwise-healthy page — a tinted card the rest of
 * the screen keeps flowing around. Lighter than a full `ErrorState`: used when
 * only one list/section couldn't load, never for the whole screen.
 */
export const SectionError = ({
  severity = 'danger',
  icon,
  title,
  body,
  retryLabel,
  onRetry,
}: SectionErrorProps): React.JSX.Element => {
  const surface = useSeveritySurfaces()[severity];

  return (
    <View style={[styles.card, { backgroundColor: surface.bg, borderColor: surface.border }]}>
      <View style={[styles.disc, { backgroundColor: surface.disc }]}>
        <Ionicons name={icon} size={sizes.iconLg} color={surface.icon} />
      </View>
      <ThemedText variant="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {body !== undefined ? (
        <ThemedText variant="caption" muted style={styles.body}>
          {body}
        </ThemedText>
      ) : null}
      {retryLabel !== undefined && onRetry !== undefined ? (
        <Pressable
          onPress={onRetry}
          style={[styles.retry, { borderColor: surface.icon }]}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <Ionicons name="refresh" size={sizes.iconSm} color={surface.text} />
          <ThemedText variant="caption" style={[styles.retryLabel, { color: surface.text }]}>
            {retryLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
    marginTop: spacing.xs,
    height: sizes.selectorHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  retryLabel: {
    fontWeight: '700',
  },
});
