import { View, type ViewProps } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { pickColors } from '@presentation/base/theme/colors';

export interface ThemedViewProps extends ViewProps {
  surface?: boolean;
}

export const ThemedView = ({ surface = false, style, ...rest }: ThemedViewProps): React.JSX.Element => {
  const { scheme } = useTheme();
  const colors = pickColors(scheme);
  const backgroundColor = surface ? colors.surface : colors.background;
  return <View {...rest} style={[{ backgroundColor }, style]} />;
};
