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
import { pickColors } from '@presentation/base/theme/colors';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';

export const LoginScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { scheme } = useTheme();
  const colors = pickColors(scheme);

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const signIn = authStore((s) => s.signIn);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusField, setFocusField] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const fieldsEmpty =
    username.trim().length === 0 || password.trim().length === 0;

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/recipes');
    }
  }, [state.status, router]);

  const handleSignIn = useCallback(() => {
    if (username.trim().length === 0 || password.trim().length === 0) {
      return;
    }
    void signIn(username, password);
  }, [signIn, username, password]);

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
          <ThemedText variant="headline" style={styles.appName}>
            {t().login.title}
          </ThemedText>
          <ThemedText variant="body" style={styles.gradientSubtitle}>
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
              name="account-outline"
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
                    focusField === 'username'
                      ? colors.inputBorderFocused
                      : colors.inputBorder,
                },
              ]}
              placeholder={t().login.usernamePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setFocusField('username')}
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
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText
                variant="body"
                style={[styles.signInLabel, { color: colors.primaryText }]}
              >
                {t().login.signIn}
              </ThemedText>
            )}
          </Pressable>
        </View>

        <ThemedText variant="caption" muted style={styles.hint}>
          {t().login.hint}
        </ThemedText>
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
    color: '#FFFFFF',
    marginTop: 12,
  },
  gradientSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
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
  hint: {
    marginTop: 16,
    textAlign: 'center',
  },
});
