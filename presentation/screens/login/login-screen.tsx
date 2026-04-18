import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';

export const LoginScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { authStore } = useStores();
  const state = authStore((s) => s.state);
  const signIn = authStore((s) => s.signIn);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

  const inputColor = isDark ? '#fff' : '#000';
  const inputBorderColor = isDark ? '#444' : '#ccc';
  const placeholderColor = isDark ? '#888' : '#999';

  return (
    <ScreenContainer>
      {isLoading ? (
        <View style={styles.content}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.content}>
          <ThemedText variant="title">{t().login.title}</ThemedText>
          <ThemedText variant="body" muted style={styles.subtitle}>
            {t().login.subtitle}
          </ThemedText>
          <TextInput
            style={[styles.input, { color: inputColor, borderColor: inputBorderColor }]}
            placeholder={t().login.usernamePlaceholder}
            placeholderTextColor={placeholderColor}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextInput
            ref={passwordRef}
            style={[styles.input, { color: inputColor, borderColor: inputBorderColor }]}
            placeholder={t().login.passwordPlaceholder}
            placeholderTextColor={placeholderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
          />
          {errorMessage ? (
            <ThemedText variant="caption" style={styles.error}>
              {errorMessage}
            </ThemedText>
          ) : null}
          <View style={styles.button}>
            <PrimaryButton
              label={t().login.signIn}
              onPress={handleSignIn}
              disabled={fieldsEmpty}
            />
          </View>
          <ThemedText variant="caption" muted style={styles.hint}>
            {t().login.hint}
          </ThemedText>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  hint: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  error: {
    marginTop: spacing.md,
    color: '#e74c3c',
    textAlign: 'center',
  },
});
