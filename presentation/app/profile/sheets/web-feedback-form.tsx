import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { fontSizes, radii, sizes, spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface WebFeedbackFormProps {
  subject: string;
  message: string;
  onChangeSubject: (value: string) => void;
  onChangeMessage: (value: string) => void;
  showError: boolean;
}

/** Form body for the web feedback modal: subtitle, title + message inputs, and an error banner. */
export const WebFeedbackForm = ({
  subject,
  message,
  onChangeSubject,
  onChangeMessage,
  showError,
}: WebFeedbackFormProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={styles.wrap}>
      <ThemedText variant="body" muted>{t().support.subtitle}</ThemedText>
      <View style={styles.field}>
        <ThemedText variant="caption" muted style={styles.fieldLabel}>
          {t().support.subject.toUpperCase()}
        </ThemedText>
        <TextInput
          value={subject}
          onChangeText={onChangeSubject}
          placeholder={t().support.subjectPlaceholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="next"
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
        />
      </View>
      <View style={styles.field}>
        <ThemedText variant="caption" muted style={styles.fieldLabel}>
          {t().support.message.toUpperCase()}
        </ThemedText>
        <TextInput
          value={message}
          onChangeText={onChangeMessage}
          placeholder={t().support.messagePlaceholder}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={[
            styles.input,
            styles.textArea,
            { color: colors.text, backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
        />
      </View>
      {showError ? (
        <ThemedText variant="caption" style={[styles.errorText, { color: colors.danger }]}>
          {t().support.error}
        </ThemedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    height: sizes.inputHeightSm,
    borderRadius: radii.lg,
    borderWidth: sizes.inputBorderWidth,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
  },
  textArea: {
    height: sizes.feedbackMessageMinHeight,
    paddingTop: spacing.md,
  },
  errorText: {
    fontWeight: '600',
  },
});
