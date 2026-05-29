import { StyleSheet, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface AiBannerCardProps {
  onPress: () => void;
}

export const AiBannerCard = ({ onPress }: AiBannerCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t().recipes.aiPromo}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={[styles.iconBadge, { backgroundColor: colors.gradientSurface }]}>
          <Ionicons name="sparkles" size={sizes.iconMd} color={colors.onOverlay} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText variant="body" style={[styles.title, { color: colors.onOverlay }]}>
            {t().recipes.aiPromo}
          </ThemedText>
          <ThemedText variant="caption" style={[styles.subtitle, { color: colors.onOverlay }]}>
            {t().recipes.aiPromoSub}
          </ThemedText>
        </View>
        <View style={[styles.arrowBtn, { backgroundColor: colors.gradientSurface }]}>
          <Ionicons name="arrow-forward" size={sizes.iconSm} color={colors.onOverlay} />
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconBadge: {
    width: sizes.badgeSm + spacing.sm,
    height: sizes.badgeSm + spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  subtitle: {
    opacity: 0.82,
    fontSize: fontSizes.small,
  },
  arrowBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
