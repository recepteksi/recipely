import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/keyboard-avoider';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { RecipelyLogo } from '@presentation/base/widgets/recipely-logo';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { SocialSignInButton } from '@presentation/base/widgets/social-sign-in-button';
import { FormBanner } from '@presentation/base/widgets/form-banner';
import { authFormMessage } from '@presentation/base/errors/auth-form-message';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { resolveRedirect } from '@presentation/screens/login/resolve-redirect';

const AUTH_CARD_MAX_WIDTH = 460;

export const LoginScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const colors = useTheme().colors;
  const { isWebShell, orientation } = useLayout();
  const isLandscapeShell = isWebShell && orientation === 'landscape';

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
      router.replace(resolveRedirect(redirect) as Href);
    }
  }, [state.status, router, redirect]);

  const handleSignIn = useCallback(() => {
    if (email.trim().length === 0 || password.trim().length === 0) {
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

  const hero = (
    <View style={[styles.gradientContent, isLandscapeShell ? styles.heroLandscape : null]}>
      <RecipelyLogo size={isLandscapeShell ? 96 : 72} monochrome mono={colors.onOverlay} />
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
                { backgroundColor: colors.cardBackground, ...shadows.lg },
              ]}
            >
              {renderFormFields()}
            </View>
            {t().login.hint ? (
              <ThemedText variant="caption" muted style={styles.hint}>
                {t().login.hint}
              </ThemedText>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoider>
    );
  }

  function renderFormFields(): React.JSX.Element {
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

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
          <ThemedText variant="caption" muted style={styles.dividerLabel}>
            {t().login.orContinueWith}
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: colors.inputBorder }]} />
        </View>

        <SocialSignInButton
          provider="google"
          label={t().login.signInWithGoogle}
          onPress={() => { void signInWithGoogle(); }}
          disabled={isLoading}
          borderColor={colors.inputBorder}
        />

        {Platform.OS !== 'android' && (
          <SocialSignInButton
            provider="apple"
            label={t().login.signInWithApple}
            onPress={() => { void signInWithApple(); }}
            disabled={isLoading}
            borderColor={colors.inputBorder}
          />
        )}

        <View style={styles.signUpRow}>
          <ThemedText variant="body" style={{ color: colors.textMuted }}>
            {t().login.noAccount}
          </ThemedText>
          <Pressable
            onPress={() => router.push('/register')}
            accessibilityRole="button"
            accessibilityLabel={t().login.signUp}
          >
            <ThemedText variant="body" style={[styles.signUpLink, { color: colors.primary }]}>
              {t().login.signUp}
            </ThemedText>
          </Pressable>
        </View>
      </>
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

        {hero}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              ...shadows.lg,
            },
          ]}
        >
          {renderFormFields()}
        </View>

        {t().login.hint ? (
          <ThemedText variant="caption" muted style={styles.hint}>
            {t().login.hint}
          </ThemedText>
        ) : null}
      </ScrollView>
    </KeyboardAvoider>
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
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    paddingVertical: 4,
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
    paddingTop: 0,
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
  },
});
