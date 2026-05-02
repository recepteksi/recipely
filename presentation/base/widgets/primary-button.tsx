import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii, sizes } from '@presentation/base/theme';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const isInteractive = !loading && !disabled;
  const backgroundColor = isInteractive ? colors.primary : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed && isInteractive ? 0.85 : 1 },
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <ThemedText variant="subtitle" style={{ color: colors.primaryText }}>
            {label}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
