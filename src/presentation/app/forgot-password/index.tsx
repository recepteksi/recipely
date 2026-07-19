import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { InputView } from '@presentation/app/forgot-password/body/forgot-password-input-view';
import { SuccessView } from '@presentation/app/forgot-password/body/forgot-password-success-view';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { CharConstants, ValueConstants } from '@core/constants';

const AUTH_CARD_MAX_WIDTH = 460;

export const ForgotPasswordScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

  const { authStore } = useStores();
  const requestPasswordReset = authStore((s) => s.requestPasswordReset);

  const [email, setEmail] = useState(CharConstants.empty);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>(undefined);

  const handleSend = async (): Promise<void> => {
    if (email.trim().length === ValueConstants.zero) return;
    setSendError(undefined);
    setLoading(true);
    const ok = await requestPasswordReset(email.trim());
    setLoading(false);
    if (ok) {
      setSent(true);
    } else {
      setSendError(t().forgotPassword.sendError);
    }
  };

  const hero = (
    <View style={[styles.gradientCenter, isLandscapeShell ? styles.heroLandscape : null]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.gradientSurface }]}>
        <Ionicons name="key-outline" size={isLandscapeShell ? 32 : 26} color={colors.onOverlay} />
      </View>
      <ThemedText variant="subtitle" style={[styles.heroTitle, { color: colors.onOverlay }]}>
        {t().forgotPassword.title}
      </ThemedText>
      <View style={styles.heroSubtitleWrap}>
        <ThemedText variant="body" style={[styles.heroSubtitle, { color: colors.onOverlay }]}>
          {t().forgotPassword.subtitle}
        </ThemedText>
      </View>
    </View>
  );

  const cardBody = sent ? (
    <SuccessView
      email={email}
      onBack={() => router.back()}
      onTryDifferent={() => setSent(false)}
    />
  ) : (
    <InputView
      email={email}
      onChangeEmail={setEmail}
      focused={focused}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      loading={loading}
      onSend={() => { void handleSend(); }}
      onBack={() => router.back()}
      error={sendError}
    />
  );

  if (isLandscapeShell) {
    return (
      <KeyboardAvoider style={styles.flex}>
        <View style={[styles.splitRoot, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
            end={{ x: 1, y: 1 }}
            style={styles.splitHero}
          >
            {hero}
          </LinearGradient>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.splitFormContent}
            style={styles.splitFormPane}
          >
            <View
              style={[
                styles.card,
                styles.cardSplit,
                { backgroundColor: colors.cardBackground },
                shadows.lg,
              ]}
            >
              {cardBody}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoider>
    );
  }

  return (
    <KeyboardAvoider style={styles.flex}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        style={{ backgroundColor: colors.background }}
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.gradientSurface }]}
          accessibilityRole="button"
          accessibilityLabel={t().forgotPassword.backToLogin}
        >
          <Ionicons name="chevron-back" size={20} color={colors.onOverlay} />
        </Pressable>

        {hero}

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground },
            shadows.lg,
          ]}
        >
          {cardBody}
        </View>
      </ScrollView>
    </KeyboardAvoider>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  gradient: {
    position: 'absolute',
    top: ValueConstants.zero,
    left: ValueConstants.zero,
    right: ValueConstants.zero,
    height: 280,
    borderBottomLeftRadius: radii.xxxl,
    borderBottomRightRadius: radii.xxxl,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.xxxl,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradientCenter: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: -40,
    marginBottom: spacing.xxl,
  },
  splitRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  splitHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  heroLandscape: {
    height: 'auto',
    maxWidth: 420,
  },
  splitFormPane: {
    flex: 1,
  },
  splitFormContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  cardSplit: {
    width: '100%',
    maxWidth: AUTH_CARD_MAX_WIDTH,
    marginHorizontal: ValueConstants.zero,
    marginTop: ValueConstants.zero,
    marginBottom: ValueConstants.zero,
  },
});

export default ForgotPasswordScreen;
