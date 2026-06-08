import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { FormBanner } from '@presentation/base/widgets/form-banner';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const AUTH_CARD_MAX_WIDTH = 460;
const MIN_PASSWORD_LENGTH = 8;

export const ResetPasswordScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

  const { token } = useLocalSearchParams<{ token?: string }>();
  const tokenValue = typeof token === 'string' ? token.trim() : '';

  const { authStore } = useStores();
  const resetPassword = authStore((s) => s.resetPassword);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  if (tokenValue.length === 0) {
    cardBody = (
      <InvalidLinkView onBack={() => router.replace('/login')} />
    );
  } else if (succeeded) {
    cardBody = (
      <SuccessView onBack={() => router.replace('/login')} />
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
        onBack={() => router.replace('/login')}
      />
    );
  }

  if (isLandscapeShell) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          onPress={() => router.replace('/login')}
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
    </KeyboardAvoidingView>
  );
};

interface FormViewProps {
  newPassword: string;
  onChangeNew: (v: string) => void;
  confirmPassword: string;
  onChangeConfirm: (v: string) => void;
  showNew: boolean;
  onToggleNew: () => void;
  showConfirm: boolean;
  onToggleConfirm: () => void;
  focusField: string | null;
  onFocus: (field: string) => void;
  onBlur: () => void;
  confirmRef: React.RefObject<TextInput | null>;
  loading: boolean;
  error: string | undefined;
  onSubmit: () => void;
  onBack: () => void;
}

const FormView = ({
  newPassword,
  onChangeNew,
  confirmPassword,
  onChangeConfirm,
  showNew,
  onToggleNew,
  showConfirm,
  onToggleConfirm,
  focusField,
  onFocus,
  onBlur,
  confirmRef,
  loading,
  error,
  onSubmit,
  onBack,
}: FormViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.inputWrapper, { marginTop: spacing.xs }]}>
        <Ionicons
          name="lock-closed-outline"
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
              borderColor: focusField === 'new' ? colors.inputBorderFocused : colors.inputBorder,
            },
          ]}
          placeholder={t().resetPassword.newPasswordPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={newPassword}
          onChangeText={onChangeNew}
          secureTextEntry={!showNew}
          returnKeyType="next"
          onFocus={() => onFocus('new')}
          onBlur={onBlur}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <Pressable
          onPress={onToggleNew}
          style={styles.eyeBtn}
          accessibilityRole="button"
          accessibilityLabel={showNew ? t().resetPassword.hidePassword : t().resetPassword.showPassword}
        >
          <Ionicons
            name={showNew ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={[styles.inputWrapper, { marginTop: spacing.md }]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          ref={confirmRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor:
                focusField === 'confirm' ? colors.inputBorderFocused : colors.inputBorder,
            },
          ]}
          placeholder={t().resetPassword.confirmPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={onChangeConfirm}
          secureTextEntry={!showConfirm}
          returnKeyType="done"
          onFocus={() => onFocus('confirm')}
          onBlur={onBlur}
          onSubmitEditing={onSubmit}
        />
        <Pressable
          onPress={onToggleConfirm}
          style={styles.eyeBtn}
          accessibilityRole="button"
          accessibilityLabel={showConfirm ? t().resetPassword.hidePassword : t().resetPassword.showPassword}
        >
          <Ionicons
            name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {error !== undefined ? (
        <View style={styles.bannerRow}>
          <FormBanner message={error} />
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={loading ? t().resetPassword.submitting : t().resetPassword.submit}
          onPress={onSubmit}
          loading={loading}
          disabled={newPassword.length === 0 || confirmPassword.length === 0 || loading}
        />
      </View>

      <Pressable
        onPress={onBack}
        style={styles.textLink}
        accessibilityRole="button"
        accessibilityLabel={t().resetPassword.backToLogin}
      >
        <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          {t().resetPassword.backToLogin}
        </ThemedText>
      </Pressable>
    </>
  );
};

interface SuccessViewProps {
  onBack: () => void;
}

const SuccessView = ({ onBack }: SuccessViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.successCircle, { backgroundColor: colors.successLight }]}>
        <Ionicons name="checkmark-circle" size={40} color={colors.success} />
      </View>

      <ThemedText variant="subtitle" style={styles.cardTitle}>
        {t().resetPassword.successTitle}
      </ThemedText>

      <ThemedText variant="body" muted style={styles.cardSubtitle}>
        {t().resetPassword.successBody}
      </ThemedText>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={t().resetPassword.backToLogin}
          onPress={onBack}
        />
      </View>
    </>
  );
};

interface InvalidLinkViewProps {
  onBack: () => void;
}

const InvalidLinkView = ({ onBack }: InvalidLinkViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.successCircle, { backgroundColor: colors.dangerLight }]}>
        <Ionicons name="alert-circle" size={40} color={colors.danger} />
      </View>

      <ThemedText variant="subtitle" style={styles.cardTitle}>
        {t().resetPassword.invalidLinkTitle}
      </ThemedText>

      <ThemedText variant="body" muted style={styles.cardSubtitle}>
        {t().resetPassword.invalidLinkBody}
      </ThemedText>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={t().resetPassword.backToLogin}
          onPress={onBack}
        />
      </View>
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
    paddingRight: spacing.xxxl + spacing.lg,
    fontSize: fontSizes.body,
  },
  eyeBtn: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
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
