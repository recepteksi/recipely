import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

interface InvalidLinkViewProps {
  onBack: () => void;
}

export const InvalidLinkView = ({ onBack }: InvalidLinkViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <>
      <View style={[styles.successCircle, { backgroundColor: colors.dangerLight }]}>
        <Ionicons name="alert-circle" size={40} color={colors.danger} />
      </View>

      <ThemedText variant="subtitle" style={styles.cardTitle}>
        {t().resetPassword.invalidLinkTitle}
      </ThemedText>

      <ThemedText variant="body" muted style={styles.cardSubtitle}>
        {t().resetPassword.invalidLinkBody}
      </ThemedText>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={t().resetPassword.backToLogin}
          onPress={onBack}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  buttonRow: {
    marginTop: spacing.lg,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
