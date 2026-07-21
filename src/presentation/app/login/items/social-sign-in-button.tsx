import { Pressable, StyleSheet, Text } from 'react-native';
import { GoogleLogo } from '@presentation/app/login/items/google-logo';
import { AppleLogo } from '@presentation/app/login/items/apple-logo';
import { radii, sizes, fontSizes, spacing, BrandColors } from '@presentation/base/theme';
import { OpacityConstants } from '@presentation/base/constants';

const LOGO_SIZE = sizes.iconXxs;

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
          ? { backgroundColor: BrandColors.white, borderColor, borderWidth: sizes.inputBorderWidth }
          : { backgroundColor: BrandColors.black },
        disabled ? styles.disabled : null,
      ]}
    >
      {isGoogle ? <GoogleLogo size={LOGO_SIZE} /> : <AppleLogo size={LOGO_SIZE} color={BrandColors.white} />}
      {/* Bare Text on purpose: brand surfaces are fixed white/black regardless of theme,
          so the label color must not follow ThemedText's theme-derived color. */}
      <Text style={[styles.label, { color: isGoogle ? BrandColors.googleLabel : BrandColors.white }]}>
        {label}
      </Text>
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
    opacity: OpacityConstants.disabled,
  },
});
