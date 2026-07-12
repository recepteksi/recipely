import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { FormBanner } from '@presentation/base/widgets/feedback/form-banner';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const AUTH_CARD_MAX_WIDTH = 460;
const CODE_LENGTH = 6;
const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;

/** Whole seconds until `iso`, floored at 0. Empty/invalid → 0. */
const computeRemaining = (iso: string): number => {
  if (iso.length === 0) return 0;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.round((ms - Date.now()) / SECOND_MS));
};

/** Formats a second count as `M:SS`. */
const formatCountdown = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const VerifyCodeScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

  const params = useLocalSearchParams<{ email?: string; expiresAt?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const initialExpiresAt = typeof params.expiresAt === 'string' ? params.expiresAt : '';

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const verifyRegistration = authStore((s) => s.verifyRegistration);
  const resendRegistrationCode = authStore((s) => s.resendRegistrationCode);

  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  // Absolute expiry of the current code; the countdown derives from it so it
  // stays correct across re-renders and app backgrounding.
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [remaining, setRemaining] = useState(() => computeRemaining(initialExpiresAt));

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/recipes');
    }
  }, [state.status, router]);

  useEffect(() => {
    setRemaining(computeRemaining(expiresAt));
    if (expiresAt.length === 0) return;
    const id = setInterval(() => setRemaining(computeRemaining(expiresAt)), SECOND_MS);
    return () => clearInterval(id);
  }, [expiresAt]);

  const codeValid = code.length === CODE_LENGTH && /^\d+$/.test(code);
  const isLoading = state.status === 'loading';
  const remoteError =
    state.status === 'error'
      ? authFormMessage(state.failure, {
          unauthorized: t().verify.invalidCode,
          validation: t().verify.invalidCode,
          not_found: t().verify.invalidCode,
        })
      : undefined;
  const errorMessage = localError ?? remoteError;

  const handleVerify = useCallback(async () => {
    if (!codeValid) {
      setLocalError(t().verify.errorCode);
      return;
    }
    setLocalError(undefined);
    await verifyRegistration(email, code);
  }, [codeValid, verifyRegistration, email, code]);

  // Resend is locked until the current code expires.
  const canResend = remaining <= 0 && !resending;

  const handleResend = useCallback(async () => {
    if (remaining > 0 || resending) return;
    setResending(true);
    setResent(false);
    const challenge = await resendRegistrationCode(email);
    setResending(false);
    if (challenge) {
      setResent(true);
      setExpiresAt(challenge.expiresAt);
    }
  }, [remaining, resending, resendRegistrationCode, email]);

  const hero = (
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

  const cardBody = (
    <>
      <TextInput
        style={[
          styles.codeInput,
          {
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: focused ? colors.inputBorderFocused : colors.inputBorder,
          },
        ]}
        placeholder={t().verify.codePlaceholder}
        placeholderTextColor={colors.textMuted}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={CODE_LENGTH}
        returnKeyType="done"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={() => { void handleVerify(); }}
        accessibilityLabel={t().verify.codePlaceholder}
      />

      {errorMessage !== undefined ? (
        <View style={styles.error}>
          <FormBanner message={errorMessage} />
        </View>
      ) : null}

      {resent ? (
        <ThemedText variant="caption" style={[styles.notice, { color: colors.success }]}>
          {t().verify.resent}
        </ThemedText>
      ) : null}

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={isLoading ? t().verify.verifying : t().verify.verify}
          onPress={() => { void handleVerify(); }}
          loading={isLoading}
          disabled={!codeValid || isLoading}
        />
      </View>

      <View style={styles.expiryRow}>
        {remaining > 0 ? (
          <ThemedText variant="caption" muted>
            {t().verify.expiresIn} {formatCountdown(remaining)}
          </ThemedText>
        ) : (
          <ThemedText variant="caption" style={{ color: colors.danger }}>
            {t().verify.expired}
          </ThemedText>
        )}
      </View>

      <View style={styles.resendRow}>
        <ThemedText variant="caption" muted>
          {t().verify.noCode}
        </ThemedText>
        <Pressable
          onPress={() => { void handleResend(); }}
          disabled={!canResend}
          accessibilityRole="button"
          accessibilityLabel={t().verify.resend}
        >
          <ThemedText
            variant="caption"
            style={{
              color: canResend ? colors.primary : colors.textMuted,
              fontWeight: '600',
            }}
          >
            {t().verify.resend}
          </ThemedText>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={styles.textLink}
        accessibilityRole="button"
        accessibilityLabel={t().verify.changeEmail}
      >
        <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          {t().verify.changeEmail}
        </ThemedText>
      </Pressable>
    </>
  );

  if (isLandscapeShell) {
    return (
      <KeyboardAvoider style={styles.flex}>
        <View style={[styles.splitRoot, { backgroundColor: colors.background }]}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />

        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.gradientSurface }]}
          accessibilityRole="button"
          accessibilityLabel={t().verify.changeEmail}
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
    top: 0,
    left: 0,
    right: 0,
    height: sizes.heroImageHeight,
    borderBottomLeftRadius: radii.xxxl,
    borderBottomRightRadius: radii.xxxl,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.xxxl,
    left: spacing.lg,
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradientCenter: {
    height: sizes.heroImageHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
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
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: -sizes.cardOverlap,
    marginBottom: spacing.xxl,
  },
  codeInput: {
    height: sizes.inputHeight,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.subtitle,
    textAlign: 'center',
    letterSpacing: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
  },
  notice: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: spacing.lg,
  },
  expiryRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  textLink: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
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
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});

export default VerifyCodeScreen;
