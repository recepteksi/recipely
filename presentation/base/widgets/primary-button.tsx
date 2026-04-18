import { ActivityIndicator, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { pickColors } from '@presentation/base/theme/colors';

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
  const scheme = useColorScheme();
  const colors = pickColors(scheme);
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
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
