import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { FormBanner } from '@presentation/base/widgets/feedback/form-banner';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { AuthTextField } from '@presentation/app/register/items/auth-text-field';
import { PasswordStrengthMeter } from '@presentation/app/register/items/password-strength-meter';
import { TermsAgreement } from '@presentation/app/register/items/terms-agreement';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { EMAIL_RE, MIN_PASSWORD } from '@presentation/app/register/model/password-rules';
import { computeStrength } from '@presentation/app/register/model/compute-strength';

/**
 * Register form fields (name / email / password / confirm / terms) with inline
 * validation, password-strength meter, and submit. Owns all form state and the
 * sign-up call; the parent screen only chooses the surrounding layout.
 */
export const RegisterForm = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const register = authStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const emailValid = EMAIL_RE.test(email);
  const passwordsMatch = password.length > 0 && password === confirm;
  const strength = useMemo(() => computeStrength(password), [password]);

  const canSubmit =
    name.trim().length > 0 &&
    emailValid &&
    password.length >= MIN_PASSWORD &&
    password === confirm &&
    agree;

  const handleRegister = useCallback(async () => {
    if (name.trim().length === 0) {
      setLocalError(t().register.errorName);
      return;
    }
    if (!emailValid) {
      setLocalError(t().register.errorEmail);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setLocalError(t().register.errorPwdShort);
      return;
    }
    if (password !== confirm) {
      setLocalError(t().register.errorMismatch);
      return;
    }
    if (!agree) {
      setLocalError(t().register.errorAgree);
      return;
    }
    setLocalError(undefined);
    const challenge = await register(email, password, name);
    if (challenge) {
      router.push({
        pathname: '/verify-code',
        params: {
          email: challenge.email,
          expiresAt: challenge.expiresAt,
        },
      });
    }
  }, [name, email, emailValid, password, confirm, agree, register, router]);

  const isLoading = state.status === 'loading';
  const remoteError =
    state.status === 'error'
      ? authFormMessage(state.failure, { conflict: t().register.emailTaken })
      : undefined;
  const errorMessage = localError ?? remoteError;

  return (
    <>
      <AuthTextField
        iconName="person-outline"
        placeholder={t().register.namePlaceholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <AuthTextField
        ref={emailRef}
        iconName="mail-outline"
        placeholder={t().register.emailPlaceholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        containerStyle={styles.fieldSpacing}
        rightSlot={
          email.length > 0 ? (
            <Ionicons
              name={emailValid ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={emailValid ? colors.success : colors.danger}
              style={styles.inputStatusIcon}
            />
          ) : undefined
        }
      />

      <AuthTextField
        ref={passwordRef}
        iconName="lock-closed-outline"
        placeholder={t().register.passwordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPwd}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        containerStyle={styles.passwordSpacing}
        rightSlot={
          <Pressable onPress={() => setShowPwd((s) => !s)} hitSlop={8} style={styles.eyeButton}>
            <MaterialCommunityIcons
              name={showPwd ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        }
      />

      {password.length > 0 ? <PasswordStrengthMeter strength={strength} /> : null}

      <AuthTextField
        ref={confirmRef}
        iconName="lock-closed-outline"
        placeholder={t().register.confirmPlaceholder}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry={!showPwd}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={() => { void handleRegister(); }}
        containerStyle={styles.fieldSpacing}
        rightSlot={
          confirm.length > 0 ? (
            <Ionicons
              name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={passwordsMatch ? colors.success : colors.danger}
              style={styles.inputStatusIcon}
            />
          ) : undefined
        }
      />

      <TermsAgreement agree={agree} onToggle={() => setAgree((a) => !a)} />

      {errorMessage !== undefined ? (
        <View style={styles.error}>
          <FormBanner message={errorMessage} />
        </View>
      ) : null}

      <Pressable
        onPress={() => { void handleRegister(); }}
        disabled={!canSubmit || isLoading}
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary },
          !canSubmit || isLoading ? styles.submitDisabled : null,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <ThemedText variant="body" style={[styles.submitLabel, { color: colors.primaryText }]}>
            {t().register.signUp}
          </ThemedText>
        )}
      </Pressable>

      <View style={styles.signInRow}>
        <ThemedText variant="caption" style={{ color: colors.textMuted }}>
          {t().register.haveAccount}
        </ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText variant="caption" style={[styles.signInLink, { color: colors.primary }]}>
            {t().register.signIn}
          </ThemedText>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fieldSpacing: {
    marginTop: spacing.md,
  },
  passwordSpacing: {
    marginTop: spacing.md,
    marginBottom: 6,
  },
  inputStatusIcon: {
    position: 'absolute',
    right: spacing.lg,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.sm,
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: spacing.md,
  },
  submitButton: {
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    fontWeight: '600',
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  signInLink: {
    fontWeight: '600',
  },
});
