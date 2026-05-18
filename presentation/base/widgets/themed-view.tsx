import { View, type ViewProps } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';

export interface ThemedViewProps extends ViewProps {
  surface?: boolean;
}

/** Theme-aware container that fills with background or surface color depending on the `surface` prop. */
export const ThemedView = ({ surface = false, style, ...rest }: ThemedViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const backgroundColor = surface ? colors.surface : colors.background;
  return <View {...rest} style={[{ backgroundColor }, style]} />;
};
