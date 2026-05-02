import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const computeStrength = (password: string): number => {
  let s = 0;
  if (password.length >= MIN_PASSWORD) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
};

export const RegisterScreen = (): React.JSX.Element => {
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
  const [focusField, setFocusField] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/recipes');
    }
  }, [state.status, router]);

  const emailValid = EMAIL_RE.test(email);
  const passwordsMatch = password.length > 0 && password === confirm;
  const strength = useMemo(() => computeStrength(password), [password]);

  const strengthLabels = [
    t().register.weak,
    t().register.weak,
    t().register.fair,
    t().register.good,
    t().register.strong,
  ];
  const strengthColors = [
    colors.danger,
    colors.danger,
    colors.warning,
    colors.warning,
    colors.success,
  ];
  const strengthLabel = strengthLabels[strength];
  const strengthColor = strengthColors[strength];

  const canSubmit =
    name.trim().length > 0 &&
    emailValid &&
    password.length >= MIN_PASSWORD &&
    password === confirm &&
    agree;

  const handleRegister = useCallback(() => {
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
    void register(email, password, name);
  }, [name, email, emailValid, password, confirm, agree, register]);

  const isLoading = state.status === 'loading';
  const remoteError =
    state.status === 'error' ? state.failure.message : undefined;
  const errorMessage = localError ?? remoteError;

  const inputStyle = (
    field: string,
    extra: { paddingRight?: number } = {},
  ): React.ComponentProps<typeof TextInput>['style'] => ({
    height: 52,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingLeft: 48,
    paddingRight: extra.paddingRight ?? 14,
    fontSize: 15,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    borderColor:
      focusField === field ? colors.inputBorderFocused : colors.inputBorder,
  });

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
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.gradientContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="person-outline" size={26} color="#FFFFFF" />
          </View>
          <ThemedText variant="headline" style={[styles.title, { color: '#FFFFFF' }]}>
            {t().register.title}
          </ThemedText>
          <ThemedText
            variant="body"
            style={[styles.subtitle, { color: '#FFFFFF' }]}
          >
            {t().register.subtitle}
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground, ...shadows.lg },
          ]}
        >
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={inputStyle('name')}
              placeholder={t().register.namePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setFocusField('name')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing.md }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={emailRef}
              style={inputStyle('email', { paddingRight: 44 })}
              placeholder={t().register.emailPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {email.length > 0 ? (
              <Ionicons
                name={emailValid ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={emailValid ? colors.success : colors.danger}
                style={styles.inputStatusIcon}
              />
            ) : null}
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing.md, marginBottom: 6 }]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordRef}
              style={inputStyle('password', { paddingRight: 44 })}
              placeholder={t().register.passwordPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <Pressable
              onPress={() => setShowPwd((s) => !s)}
              hitSlop={8}
              style={styles.eyeButton}
            >
              <MaterialCommunityIcons
                name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {password.length > 0 ? (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthSegments}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor: i < strength ? strengthColor : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <ThemedText
                variant="caption"
                style={{ color: strengthColor, marginTop: 4 }}
              >
                {strengthLabel}
              </ThemedText>
            </View>
          ) : null}

          <View style={[styles.inputWrapper, { marginTop: spacing.md }]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={confirmRef}
              style={inputStyle('confirm', { paddingRight: 44 })}
              placeholder={t().register.confirmPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onFocus={() => setFocusField('confirm')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={handleRegister}
            />
            {confirm.length > 0 ? (
              <Ionicons
                name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={passwordsMatch ? colors.success : colors.danger}
                style={styles.inputStatusIcon}
              />
            ) : null}
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agree }}
            onPress={() => setAgree((a) => !a)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.termsBox,
                {
                  backgroundColor: agree ? colors.primary : 'transparent',
                  borderColor: agree ? colors.primary : colors.border,
                },
              ]}
            >
              {agree ? (
                <Ionicons name="checkmark" size={14} color={colors.primaryText} />
              ) : null}
            </View>
            <ThemedText variant="caption" muted style={styles.termsText}>
              {t().register.agreeText}{' '}
              <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                {t().register.terms}
              </ThemedText>
              {' '}
              {t().register.and}{' '}
              <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                {t().register.privacy}
              </ThemedText>
            </ThemedText>
          </Pressable>

          {errorMessage !== undefined ? (
            <ThemedText
              variant="caption"
              style={[styles.error, { color: colors.danger }]}
            >
              {errorMessage}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={handleRegister}
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
              <ThemedText
                variant="body"
                style={[styles.submitLabel, { color: colors.primaryText }]}
              >
                {t().register.signUp}
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.signInRow}>
            <ThemedText variant="caption" style={{ color: colors.textMuted }}>
              {t().register.haveAccount}
            </ThemedText>
            <Pressable onPress={() => router.back()}>
              <ThemedText
                variant="caption"
                style={[styles.signInLink, { color: colors.primary }]}
              >
                {t().register.signIn}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradientContent: {
    alignItems: 'center',
    paddingTop: 76,
    paddingBottom: 24,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 10,
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 32,
    opacity: 0.88,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginTop: -40,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputStatusIcon: {
    position: 'absolute',
    right: 14,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthWrap: {
    marginBottom: spacing.sm,
  },
  strengthSegments: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  termsBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    lineHeight: 18,
  },
  error: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
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
    gap: 4,
  },
  signInLink: {
    fontWeight: '600',
  },
});
