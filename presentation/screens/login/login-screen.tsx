import { useCallback, useEffect, useRef, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export const LoginScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const signIn = authStore((s) => s.signIn);
  const signInWithGoogle = authStore((s) => s.signInWithGoogle);
  const signInWithApple = authStore((s) => s.signInWithApple);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusField, setFocusField] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const fieldsEmpty = email.trim().length === 0 || password.trim().length === 0;

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/recipes');
    }
  }, [state.status, router]);

  const handleSignIn = useCallback(() => {
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }
    void signIn(email, password);
  }, [signIn, email, password]);

  const isLoading = state.status === 'loading';
  const errorMessage =
    state.status === 'error' ? state.failure.message : undefined;

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

        <View style={styles.gradientContent}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={48}
            color={colors.onOverlay}
          />
          <ThemedText variant="headline" style={[styles.appName, { color: colors.onOverlay }]}>
            {t().login.title}
          </ThemedText>
          <ThemedText
            variant="body"
            style={[styles.gradientSubtitle, { color: colors.onOverlay }]}
          >
            {t().login.subtitle}
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              ...shadows.lg,
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="email-outline"
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
                  borderColor:
                    focusField === 'email'
                      ? colors.inputBorderFocused
                      : colors.inputBorder,
                },
              ]}
              placeholder={t().login.emailPlaceholder}
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
          </View>

          <View style={[styles.inputWrapper, { marginTop: spacing.md }]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor:
                    focusField === 'password'
                      ? colors.inputBorderFocused
                      : colors.inputBorder,
                },
              ]}
              placeholder={t().login.passwordPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              onSubmitEditing={handleSignIn}
            />
          </View>

          {errorMessage ? (
            <ThemedText
              variant="caption"
              style={[styles.error, { color: colors.danger }]}
            >
              {errorMessage}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotRow}
            accessibilityRole="button"
            accessibilityLabel={t().login.forgotPassword}
          >
            <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              {t().login.forgot}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleSignIn}
            disabled={fieldsEmpty || isLoading}
            style={[
              styles.signInButton,
              { backgroundColor: colors.primary },
              (fieldsEmpty || isLoading) ? styles.buttonDisabled : null,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <ThemedText
                variant="body"
                style={[styles.signInLabel, { color: colors.primaryText }]}
              >
                {t().login.signIn}
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.signUpRow}>
            <ThemedText variant="body" style={{ color: colors.textMuted }}>
              {t().login.noAccount}
            </ThemedText>
            <Pressable onPress={() => router.push('/register')}>
              <ThemedText variant="body" style={[styles.signUpLink, { color: colors.primary }]}>
                {t().login.signUp}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
            <ThemedText variant="caption" muted style={styles.dividerLabel}>
              {t().login.orContinueWith}
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
          </View>

          <Pressable
            onPress={() => { void signInWithGoogle(); }}
            disabled={isLoading}
            style={[styles.socialButton, { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground }]}
            accessibilityRole="button"
            accessibilityLabel={t().login.signInWithGoogle}
          >
            <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
            <ThemedText variant="body" style={[styles.socialLabel, { color: colors.text }]}>
              {t().login.signInWithGoogle}
            </ThemedText>
          </Pressable>

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={radii.lg}
              style={styles.appleButton}
              onPress={() => { void signInWithApple(); }}
            />
          )}
        </View>

        {t().login.hint ? (
          <ThemedText variant="caption" muted style={styles.hint}>
            {t().login.hint}
          </ThemedText>
        ) : null}
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
    height: '40%',
    borderBottomLeftRadius: radii.xxxl,
    borderBottomRightRadius: radii.xxxl,
  },
  gradientContent: {
    alignItems: 'center',
    paddingTop: '15%',
  },
  appName: {
    marginTop: spacing.md,
  },
  gradientSubtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
    opacity: 0.8,
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: '10%',
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
  input: {
    height: sizes.inputHeight,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingLeft: spacing.xxxl,
    paddingRight: spacing.lg,
    fontSize: fontSizes.body,
  },
  error: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  signInButton: {
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInLabel: {
    fontWeight: '600',
  },
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  signUpLink: {
    fontWeight: '600',
  },
  hint: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    flexShrink: 0,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  socialLabel: {
    fontWeight: '500',
  },
  appleButton: {
    height: sizes.buttonHeight,
    marginTop: spacing.md,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
});
