import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@infrastructure/constants/api';

export interface TermsAgreementProps {
  agree: boolean;
  onToggle: () => void;
}

/** Terms/Privacy consent checkbox with inline links to the policy pages. */
export const TermsAgreement = ({ agree, onToggle }: TermsAgreementProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: agree }}
      onPress={onToggle}
      style={styles.termsRow}
    >
      <View
        style={[
          styles.termsBox,
          {
            backgroundColor: agree ? colors.primary : 'transparent',
            borderColor: agree ? colors.primary : colors.border,
          },
        ]}
      >
        {agree ? <Ionicons name="checkmark" size={14} color={colors.primaryText} /> : null}
      </View>
      <ThemedText variant="caption" muted style={styles.termsText}>
        {t().register.agreeText}{' '}
        <ThemedText
          variant="caption"
          style={[styles.linkWeight, { color: colors.primary }]}
          accessibilityRole="link"
          accessibilityLabel={t().register.terms}
          onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
        >
          {t().register.terms}
        </ThemedText>
        {' '}
        {t().register.and}{' '}
        <ThemedText
          variant="caption"
          style={[styles.linkWeight, { color: colors.primary }]}
          accessibilityRole="link"
          accessibilityLabel={t().register.privacy}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          {t().register.privacy}
        </ThemedText>
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  termsBox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    lineHeight: 18,
  },
  linkWeight: {
    fontWeight: '600' as const,
  },
});
