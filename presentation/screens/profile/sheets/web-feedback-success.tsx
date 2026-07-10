import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii, sizes, spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

/** Success panel shown after a feedback message is sent (shared between web modal and could mirror the sheet). */
export const WebFeedbackSuccess = (): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconChip, { backgroundColor: colors.successLight }]}>
        <Ionicons name="checkmark-circle" size={sizes.iconXl} color={colors.success} />
      </View>
      <ThemedText variant="subtitle" style={styles.center}>
        {t().support.sentTitle}
      </ThemedText>
      <ThemedText variant="body" muted style={styles.center}>
        {t().support.sentSub}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconChip: {
    width: sizes.iconXl * 2,
    height: sizes.iconXl * 2,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
