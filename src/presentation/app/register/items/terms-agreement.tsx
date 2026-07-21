import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@infrastructure/constants/api';
import { ValueConstants } from '@core/constants';

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
        {agree ? <Ionicons name="checkmark" size={sizes.iconXs} color={colors.primaryText} /> : null}
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
    width: sizes.checkboxSm,
    height: sizes.checkboxSm,
    borderRadius: radii.sm,
    borderWidth: ValueConstants.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ValueConstants.one,
  },
  termsText: {
    flex: ValueConstants.one,
    lineHeight: sizes.lineHeightXs,
  },
  linkWeight: {
    fontWeight: '600' as const,
  },
});
