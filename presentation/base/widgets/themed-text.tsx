import { StyleSheet, Text, useColorScheme, type TextProps, type TextStyle } from 'react-native';
import { pickColors } from '@presentation/base/theme/colors';

export type ThemedTextVariant = 'title' | 'subtitle' | 'body' | 'caption';

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
  const scheme = useColorScheme();
  const colors = pickColors(scheme);
  const color = muted ? colors.textMuted : colors.text;
  return <Text {...rest} style={[styles[variant], { color }, style]} />;
};

const styles = StyleSheet.create<Record<ThemedTextVariant, TextStyle>>({
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
  },
});
