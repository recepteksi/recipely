import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface WebAiBannerProps {
  onPress: () => void;
}

/**
 * Wide web-only AI generator promo banner. Larger than the mobile
 * `AiBannerCard`: title + subtitle, sparkle decoration, and a "Start" chip.
 */
export const WebAiBanner = ({ onPress }: WebAiBannerProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t().recipes.aiPromo}
      style={({ pressed }) => [styles.wrapper, pressed ? styles.pressed : null]}
    >
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.card, { borderColor: colors.gradientBorder }]}
      >
        <View pointerEvents="none" style={styles.decor}>
          <Ionicons name="sparkles" size={sizes.sparkleDecor} color={colors.onOverlay} />
        </View>

        <View style={[styles.iconTile, { backgroundColor: colors.gradientSurface, borderColor: colors.gradientBorder }]}>
          <Ionicons name="sparkles" size={sizes.iconXl} color={colors.onOverlay} />
        </View>

        <View style={[styles.textBlock, { backgroundColor: colors.overlayLight }]}>
          <ThemedText style={[styles.title, { color: colors.onOverlay }]}>
            {t().recipes.aiPromo}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.onOverlay }]}>
            {t().recipes.aiPromoSubtitle}
          </ThemedText>
        </View>

        <View style={[styles.startChip, { backgroundColor: colors.primary }]}>
          <ThemedText style={[styles.startLabel, { color: colors.primaryText }]}>
            {t().recipes.aiStart}
          </ThemedText>
          <Ionicons name="chevron-forward" size={sizes.iconSm} color={colors.primaryText} />
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.xxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    top: -spacing.lg,
    right: -spacing.md,
    opacity: 0.12,
  },
  iconTile: {
    width: sizes.aiBannerIcon,
    height: sizes.aiBannerIcon,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs2,
  },
  title: {
    fontWeight: '800',
    fontSize: fontSizes.subtitle,
  },
  subtitle: {
    fontWeight: '400',
    fontSize: fontSizes.medium,
    opacity: 0.9,
  },
  startChip: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.round,
    paddingVertical: spacing.xs2,
    paddingHorizontal: spacing.md,
  },
  startLabel: {
    fontWeight: '700',
    fontSize: fontSizes.caption,
  },
});
