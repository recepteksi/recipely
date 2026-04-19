import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';

export type ThemedTextVariant = 'headline' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

export interface ThemedTextProps extends TextProps {
  variant?: ThemedTextVariant;
  muted?: boolean;
}

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
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
