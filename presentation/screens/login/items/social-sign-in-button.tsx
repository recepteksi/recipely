import { Pressable, StyleSheet, Text } from 'react-native';
import { GoogleLogo } from '@presentation/screens/login/items/google-logo';
import { AppleLogo } from '@presentation/screens/login/items/apple-logo';
import { radii, sizes, fontSizes, spacing } from '@presentation/base/theme';

const GOOGLE_BACKGROUND = '#FFFFFF';
const GOOGLE_LABEL = '#1F2937';
const APPLE_BACKGROUND = '#000000';
const APPLE_LABEL = '#FFFFFF';
const LOGO_SIZE = 18;

export interface SocialSignInButtonProps {
  provider: 'google' | 'apple';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Border color for the Google button (the Apple button is borderless on black). */
  borderColor: string;
}

/**
 * Branded Google / Apple sign-in button. Both providers share dimensions and
 * typography; only the surface, label color, and logo differ so the two stack
 * consistently beneath the divider on the auth screens.
 */
export const SocialSignInButton = ({
  provider,
  label,
  onPress,
  disabled = false,
  borderColor,
}: SocialSignInButtonProps): React.JSX.Element => {
  const isGoogle = provider === 'google';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.button,
        isGoogle
          ? { backgroundColor: GOOGLE_BACKGROUND, borderColor, borderWidth: 1.5 }
          : { backgroundColor: APPLE_BACKGROUND },
        disabled ? styles.disabled : null,
      ]}
    >
      {isGoogle ? <GoogleLogo size={LOGO_SIZE} /> : <AppleLogo size={LOGO_SIZE} color={APPLE_LABEL} />}
      {/* Bare Text on purpose: brand surfaces are fixed white/black regardless of theme,
          so the label color must not follow ThemedText's theme-derived color. */}
      <Text style={[styles.label, { color: isGoogle ? GOOGLE_LABEL : APPLE_LABEL }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sizes.inputHeight,
    borderRadius: radii.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  label: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
