import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { FormBanner } from '@presentation/base/widgets/feedback/form-banner';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { SocialAuthSection } from '@presentation/app/login/body/social-auth-section';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { CharConstants, ValueConstants } from '@core/constants';

/**
 * Login form (email / password) with inline error, forgot-password link, submit,
 * and the social/guest section. Owns the credentials state and the sign-in call;
 * the parent screen only chooses the surrounding layout.
 */
export const LoginForm = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const signIn = authStore((s) => s.signIn);
  const signInWithGoogle = authStore((s) => s.signInWithGoogle);
  const signInWithApple = authStore((s) => s.signInWithApple);

  const [email, setEmail] = useState(CharConstants.empty);
  const [password, setPassword] = useState(CharConstants.empty);
  const [focusField, setFocusField] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const fieldsEmpty = email.trim().length === ValueConstants.zero || password.trim().length === ValueConstants.zero;

  const handleSignIn = useCallback(() => {
    if (email.trim().length === ValueConstants.zero || password.trim().length === ValueConstants.zero) {
      return;
    }
    void signIn(email, password);
  }, [signIn, email, password]);

  const isLoading = state.status === 'loading';
  const errorMessage =
    state.status === 'error'
      ? authFormMessage(state.failure, {
          unauthorized: t().login.invalidCredentials,
          validation: t().login.invalidCredentials,
        })
      : undefined;

  return (
    <>
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
                focusField === 'email' ? colors.inputBorderFocused : colors.inputBorder,
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
                focusField === 'password' ? colors.inputBorderFocused : colors.inputBorder,
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
        <View style={styles.error}>
          <FormBanner message={errorMessage} />
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push('/forgot-password')}
        style={styles.forgotRow}
        accessibilityRole="button"
        accessibilityLabel={t().login.forgotPassword}
      >
        <ThemedText variant="caption" style={[styles.forgotLabel, { color: colors.primary }]}>
          {t().login.forgot}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={handleSignIn}
        disabled={fieldsEmpty || isLoading}
        style={[
          styles.signInButton,
          { backgroundColor: colors.primary },
          fieldsEmpty || isLoading ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <ThemedText variant="body" style={[styles.signInLabel, { color: colors.primaryText }]}>
            {t().login.signIn}
          </ThemedText>
        )}
      </Pressable>

      <SocialAuthSection
        disabled={isLoading}
        onGoogle={() => { void signInWithGoogle(); }}
        onApple={() => { void signInWithApple(); }}
        onSignUp={() => router.push('/register')}
        onGuest={() => router.replace('/recipes')}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  error: {
    marginTop: spacing.md,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  forgotLabel: {
    fontWeight: '600',
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
});
