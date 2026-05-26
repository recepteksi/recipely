import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export const ForgotPasswordScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = (): void => {
    if (email.trim().length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

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
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.gradientSurface }]}
          accessibilityRole="button"
          accessibilityLabel={t().forgotPassword.backToLogin}
        >
          <Ionicons name="chevron-back" size={20} color={colors.onOverlay} />
        </Pressable>

        <View style={styles.gradientCenter}>
          <View style={[styles.iconBadge, { backgroundColor: colors.gradientSurface }]}>
            <Ionicons name="key-outline" size={26} color={colors.onOverlay} />
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground },
            shadows.lg,
          ]}
        >
          {sent ? (
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
              onSend={handleSend}
              onBack={() => router.back()}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
}

const InputView = ({
  email, onChangeEmail, focused, onFocus, onBlur, loading, onSend, onBack,
}: InputViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <ThemedText variant="subtitle" style={styles.cardTitle}>
        {t().forgotPassword.title}
      </ThemedText>
      <ThemedText variant="body" muted style={styles.subtitle}>
        {t().forgotPassword.subtitle}
      </ThemedText>

      <View style={[styles.inputWrapper, { marginTop: spacing.lg }]}>
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

      <ThemedText variant="body" muted style={styles.subtitle}>
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
    height: 220,
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
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: -40,
    marginBottom: spacing.xxl,
  },
  cardTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
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
});
