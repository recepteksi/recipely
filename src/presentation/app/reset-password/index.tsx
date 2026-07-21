import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { FormView } from '@presentation/app/reset-password/body/reset-password-form-view';
import { SuccessView } from '@presentation/app/reset-password/body/reset-password-success-view';
import { InvalidLinkView } from '@presentation/app/reset-password/body/reset-password-invalid-link-view';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { CharConstants, ValueConstants } from '@core/constants';
import { RoutePaths } from '@presentation/base/constants';

const AUTH_CARD_MAX_WIDTH = 460;
const MIN_PASSWORD_LENGTH = 8;

export const ResetPasswordScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

  const { token } = useLocalSearchParams<{ token?: string }>();
  const tokenValue = typeof token === 'string' ? token.trim() : CharConstants.empty;

  const { authStore } = useStores();
  const resetPassword = authStore((s) => s.resetPassword);

  const [newPassword, setNewPassword] = useState(CharConstants.empty);
  const [confirmPassword, setConfirmPassword] = useState(CharConstants.empty);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const confirmRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(t().resetPassword.tooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t().resetPassword.mismatch);
      return;
    }
    setError(undefined);
    setLoading(true);
    const failure = await resetPassword(tokenValue, newPassword);
    setLoading(false);
    if (failure === null) {
      setSucceeded(true);
    } else {
      setError(
        authFormMessage(failure, {
          not_found: t().resetPassword.invalidOrExpired,
          validation: t().resetPassword.invalidOrExpired,
        }),
      );
    }
  }, [newPassword, confirmPassword, resetPassword, tokenValue]);

  const hero = (
    <View style={[styles.gradientCenter, isLandscapeShell ? styles.heroLandscape : null]}>
      <View style={[styles.iconBadge, { backgroundColor: colors.gradientSurface }]}>
        <Ionicons
          name="lock-closed-outline"
          size={isLandscapeShell ? 32 : 26}
          color={colors.onOverlay}
        />
      </View>
      <ThemedText variant="subtitle" style={[styles.heroTitle, { color: colors.onOverlay }]}>
        {t().resetPassword.title}
      </ThemedText>
      <View style={styles.heroSubtitleWrap}>
        <ThemedText variant="body" style={[styles.heroSubtitle, { color: colors.onOverlay }]}>
          {t().resetPassword.subtitle}
        </ThemedText>
      </View>
    </View>
  );

  let cardBody: React.JSX.Element;

  if (tokenValue.length === ValueConstants.zero) {
    cardBody = (
      <InvalidLinkView onBack={() => router.replace(RoutePaths.login)} />
    );
  } else if (succeeded) {
    cardBody = (
      <SuccessView onBack={() => router.replace(RoutePaths.login)} />
    );
  } else {
    cardBody = (
      <FormView
        newPassword={newPassword}
        onChangeNew={setNewPassword}
        confirmPassword={confirmPassword}
        onChangeConfirm={setConfirmPassword}
        showNew={showNew}
        onToggleNew={() => setShowNew((v) => !v)}
        showConfirm={showConfirm}
        onToggleConfirm={() => setShowConfirm((v) => !v)}
        focusField={focusField}
        onFocus={setFocusField}
        onBlur={() => setFocusField(null)}
        confirmRef={confirmRef}
        loading={loading}
        error={error}
        onSubmit={() => { void handleSubmit(); }}
        onBack={() => router.replace(RoutePaths.login)}
      />
    );
  }

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
          onPress={() => router.replace(RoutePaths.login)}
          style={[styles.backBtn, { backgroundColor: colors.gradientSurface }]}
          accessibilityRole="button"
          accessibilityLabel={t().resetPassword.backToLogin}
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

export default ResetPasswordScreen;
