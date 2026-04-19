import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';

export interface AvatarImageProps {
  uri?: string;
  name: string;
  size: number;
}

export const AvatarImage = ({ uri, name, size }: AvatarImageProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const borderRadius = size / 2;
  const initial = name.charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius }} />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius, backgroundColor: colors.avatarBackground },
      ]}
    >
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: colors.primary }}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
