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
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';

export const LoginScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const signIn = authStore((s) => s.signIn);

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
            color="#FFFFFF"
          />
          <ThemedText variant="headline" style={[styles.appName, { color: '#FFFFFF' }]}>
            {t().login.title}
          </ThemedText>
          <ThemedText
            variant="body"
            style={[styles.gradientSubtitle, { color: '#FFFFFF' }]}
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

          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  gradientContent: {
    alignItems: 'center',
    paddingTop: '15%',
  },
  appName: {
    marginTop: 12,
  },
  gradientSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    opacity: 0.8,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
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
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 15,
  },
  error: {
    marginTop: 12,
    textAlign: 'center',
  },
  signInButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
    marginTop: 16,
    gap: 4,
  },
  signUpLink: {
    fontWeight: '600',
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
});
