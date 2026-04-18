import { View, useColorScheme, type ViewProps } from 'react-native';
import { pickColors } from '@presentation/base/theme/colors';

export interface ThemedViewProps extends ViewProps {
  surface?: boolean;
}

export const ThemedView = ({ surface = false, style, ...rest }: ThemedViewProps): React.JSX.Element => {
  const scheme = useColorScheme();
  const colors = pickColors(scheme);
  const backgroundColor = surface ? colors.surface : colors.background;
  return <View {...rest} style={[{ backgroundColor }, style]} />;
};
