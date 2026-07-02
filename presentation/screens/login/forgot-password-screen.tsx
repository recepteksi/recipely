import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { FormBanner } from '@presentation/base/widgets/form-banner';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const AUTH_CARD_MAX_WIDTH = 460;

export const ForgotPasswordScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

  const { authStore } = useStores();
  const requestPasswordReset = authStore((s) => s.requestPasswordReset);

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>(undefined);

  const handleSend = async (): Promise<void> => {
    if (email.trim().length === 0) return;
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

interface InputViewProps {
  email: string;
  onChangeEmail: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  loading: boolean;
  onSend: () => void;
  onBack: () => void;
  error: string | undefined;
}

const InputView = ({
  email, onChangeEmail, focused, onFocus, onBlur, loading, onSend, onBack, error,
}: InputViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.inputWrapper, { marginTop: spacing.xs }]}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: focused ? colors.inputBorderFocused : colors.inputBorder,
            },
          ]}
          placeholder={t().forgotPassword.emailPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="send"
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSend}
        />
      </View>

      <ThemedText variant="caption" muted style={styles.hint}>
        {t().forgotPassword.hint}
      </ThemedText>

      {error !== undefined ? (
        <View style={styles.bannerRow}>
          <FormBanner message={error} />
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={loading ? t().forgotPassword.sending : t().forgotPassword.send}
          onPress={onSend}
          loading={loading}
          disabled={email.trim().length === 0}
        />
      </View>

      <Pressable
        onPress={onBack}
        style={styles.textLink}
        accessibilityRole="button"
        accessibilityLabel={t().forgotPassword.backToLogin}
      >
        <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          {t().forgotPassword.backToLogin}
        </ThemedText>
      </Pressable>
    </>
  );
};

interface SuccessViewProps {
  email: string;
  onBack: () => void;
  onTryDifferent: () => void;
}

const SuccessView = ({ email, onBack, onTryDifferent }: SuccessViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.successCircle, { backgroundColor: colors.successLight }]}>
        <Ionicons name="checkmark-circle" size={40} color={colors.success} />
      </View>

      <ThemedText variant="subtitle" style={styles.cardTitle}>
        {t().forgotPassword.sentTitle}
      </ThemedText>

      <ThemedText variant="body" muted style={styles.cardSubtitle}>
        {t().forgotPassword.sentBody}{' '}
        <ThemedText variant="body" style={{ fontWeight: '700' }}>
          {email}
        </ThemedText>
      </ThemedText>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={t().forgotPassword.backToLogin}
          onPress={onBack}
        />
      </View>

      <Pressable
        onPress={onTryDifferent}
        style={styles.textLink}
        accessibilityRole="button"
        accessibilityLabel={t().forgotPassword.tryDifferent}
      >
        <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          {t().forgotPassword.tryDifferent}
        </ThemedText>
      </Pressable>
    </>
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
  cardTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: -40,
    marginBottom: spacing.xxl,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 1,
  },
  input: {
    height: sizes.inputHeight,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingLeft: spacing.xxxl,
    paddingRight: spacing.lg,
    fontSize: fontSizes.body,
  },
  hint: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    fontSize: fontSizes.small,
  },
  bannerRow: {
    marginTop: spacing.md,
  },
  buttonRow: {
    marginTop: spacing.lg,
  },
  textLink: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
