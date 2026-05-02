import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@presentation/base/theme/theme-context';

export interface AvatarImageProps {
  uri?: string;
  name: string;
  size: number;
}

const initialsFor = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
};

export const AvatarImage = ({ uri, name, size }: AvatarImageProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const borderRadius = size / 2;

  if (uri !== undefined && uri.length > 0) {
    return (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius }} />
    );
  }

  // Fallback uses the primary gradient so the avatar always lifts off the
  // theme's pale light backgrounds (e.g. Crimson Ember bg ≈ primaryLight).
  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fallback, { width: size, height: size, borderRadius }]}
    >
      <View style={styles.innerOverlay}>
        <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: '#FFFFFF' }}>
          {initialsFor(name)}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
