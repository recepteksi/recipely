import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { fontSizes } from '@presentation/base/theme';
import type { ThemedTextVariant } from '@presentation/base/widgets/themed-text-variant';

export interface ThemedTextProps extends TextProps {
  variant?: ThemedTextVariant;
  muted?: boolean;
}

/** Theme-aware text primitive that applies variant typography and adaptive color. */
export const ThemedText = ({
  variant = 'body',
  muted = false,
  style,
  ...rest
}: ThemedTextProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const color = muted ? colors.textMuted : colors.text;
  return <Text {...rest} style={[styles[variant], { color }, style]} />;
};

const styles = StyleSheet.create<Record<ThemedTextVariant, TextStyle>>({
  headline: {
    fontSize: fontSizes.headline,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: '400',
    lineHeight: 18,
  },
  label: {
    fontSize: fontSizes.label,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
