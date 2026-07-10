import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@presentation/base/widgets/sheets/bottom-sheet';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useStores } from '@presentation/bootstrap/stores-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { fontSizes, radii, sizes, spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Mobile bottom sheet for the Help & Feedback form. Shows a form on open and a success state after submission. */
export const FeedbackSheet = ({ visible, onClose }: FeedbackSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { feedbackStore } = useStores();
  const submit = feedbackStore((s) => s.submit);
  const isSubmitting = feedbackStore((s) => s.isSubmitting);
  const error = feedbackStore((s) => s.error);
  const reset = feedbackStore((s) => s.reset);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // UI deliberately requires `subject` too, even though the domain treats it as
  // optional — keep both guards in sync if this is ever loosened.
  const canSend = subject.trim().length > 0 && message.trim().length > 0;

  const handleSend = async (): Promise<void> => {
    const ok = await submit({ subject, message });
    if (ok) setSent(true);
  };

  const handleClose = (): void => {
    reset();
    setSubject('');
    setMessage('');
    setSent(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title={t().support.sheetTitle} onClose={handleClose}>
      {sent ? (
        <View style={styles.successWrap}>
          <View style={[styles.iconChip, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={sizes.iconXl} color={colors.success} />
          </View>
          <ThemedText variant="subtitle" style={styles.center}>
            {t().support.sentTitle}
          </ThemedText>
          <ThemedText variant="body" muted style={styles.center}>
            {t().support.sentSub}
          </ThemedText>
          <Pressable
            onPress={handleClose}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t().support.sentDone}
          >
            <ThemedText variant="subtitle" style={{ color: colors.primaryText }}>
              {t().support.sentDone}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <ThemedText variant="body" muted>{t().support.subtitle}</ThemedText>
          <View style={styles.field}>
            <ThemedText variant="caption" muted style={styles.fieldLabel}>
              {t().support.subject.toUpperCase()}
            </ThemedText>
            <TextInput
              value={subject}
              onChangeText={setSubject}
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
              onChangeText={setMessage}
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
          {error !== null ? (
            <ThemedText variant="caption" style={[styles.errorText, { color: colors.danger }]}>
              {t().support.error}
            </ThemedText>
          ) : null}
          <Pressable
            onPress={() => void handleSend()}
            disabled={!canSend || isSubmitting}
            style={[
              styles.actionBtn,
              { backgroundColor: canSend && !isSubmitting ? colors.primary : colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t().support.send}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <ThemedText variant="subtitle" style={{ color: colors.primaryText }}>
                {t().support.send}
              </ThemedText>
            )}
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  form: {
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
  actionBtn: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg2,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
  successWrap: {
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
