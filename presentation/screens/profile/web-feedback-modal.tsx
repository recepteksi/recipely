import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { WebFeedbackForm } from '@presentation/screens/profile/web-feedback-form';
import { WebFeedbackSuccess } from '@presentation/screens/profile/web-feedback-success';
import { useStores } from '@presentation/bootstrap/stores-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii, shadows, sizes, spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface WebFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Centered web-only feedback dialog (mobile uses FeedbackSheet instead).
 * Thin state-router: renders WebFeedbackForm until the message is sent, then
 * swaps to WebFeedbackSuccess.
 */
export const WebFeedbackModal = ({ visible, onClose }: WebFeedbackModalProps): React.JSX.Element => {
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.scrim }]}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel={t().support.cancel}
      >
        <Pressable
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            shadows.lg,
          ]}
          onPress={() => {}}
          accessibilityRole="none"
          accessibilityLabel={t().support.sheetTitle}
        >
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <Pressable
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel={t().support.cancel}
            >
              <Ionicons name="close" size={sizes.iconMd} color={colors.text} />
            </Pressable>
            <ThemedText variant="subtitle" style={styles.title}>
              {t().support.sheetTitle}
            </ThemedText>
            <View style={styles.closeBtn} />
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {sent ? (
              <WebFeedbackSuccess />
            ) : (
              <WebFeedbackForm
                subject={subject}
                message={message}
                onChangeSubject={setSubject}
                onChangeMessage={setMessage}
                showError={error !== null}
              />
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            {sent ? (
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
            ) : (
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
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: sizes.webModalMaxWidth,
    maxHeight: '86%',
    borderRadius: radii.xxl,
    borderWidth: sizes.inputBorderWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg2,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: sizes.webModalCloseBtn,
    height: sizes.webModalCloseBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
  },
  body: {
    padding: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  actionBtn: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg2,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
});
