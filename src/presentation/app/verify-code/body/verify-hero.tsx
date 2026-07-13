import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface VerifyHeroProps {
  isLandscapeShell: boolean;
  email: string;
}

/** Mail badge + title/subtitle (and target email) atop the verify screen. */
export const VerifyHero = ({ isLandscapeShell, email }: VerifyHeroProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={[styles.gradientCenter, isLandscapeShell ? styles.heroLandscape : null]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.gradientSurface }]}>
        <Ionicons name="mail-unread-outline" size={26} color={colors.onOverlay} />
      </View>
      <ThemedText variant="subtitle" style={[styles.heroTitle, { color: colors.onOverlay }]}>
        {t().verify.title}
      </ThemedText>
      <View style={styles.heroSubtitleWrap}>
        <ThemedText variant="body" style={[styles.heroSubtitle, { color: colors.onOverlay }]}>
          {t().verify.subtitle}
        </ThemedText>
        {email.length > 0 ? (
          <ThemedText variant="body" style={[styles.heroEmail, { color: colors.onOverlay }]}>
            {email}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientCenter: {
    height: sizes.heroImageHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  heroLandscape: {
    height: 'auto',
    maxWidth: 420,
  },
  iconBadge: {
    width: sizes.avatarMd,
    height: sizes.avatarMd,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitleWrap: {
    opacity: 0.82,
    alignItems: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  heroEmail: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: spacing.xxs,
  },
});
