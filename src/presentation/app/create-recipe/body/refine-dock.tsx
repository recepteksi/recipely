import { useRef } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { ChatMessage } from '@domain/drafts/chat-message';
import { useKeyboardVisible } from '@presentation/app/create-recipe/hooks/use-keyboard-visible';

export interface RefineDockProps {
  chatHistory: readonly ChatMessage[];
  chatInput: string;
  onChangeChatInput: (value: string) => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  refining: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onSubmit: (instruction: string) => void;
  bottomInset: number;
}

const QUICK_CHIP_KEYS = ['chipVegan', 'chipFaster', 'chipSpicier', 'chipHealthier', 'chipKid'] as const;

/** Sticky bottom AI dock: chat transcript, quick chips, "Try again", free-text. */
export const RefineDock = ({
  chatHistory,
  chatInput,
  onChangeChatInput,
  expanded,
  onExpand,
  onCollapse,
  refining,
  canRegenerate,
  onRegenerate,
  onSubmit,
  bottomInset,
}: RefineDockProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const scrollRef = useRef<ScrollView>(null);
  const canSend = chatInput.trim().length > 0 && !refining;
  // WHY: `KeyboardAvoidingView` (in the parent screen) already pads its content
  // up flush with the keyboard's top edge once shown — that alone clears the
  // home indicator area too, since the keyboard occludes it. Adding the fixed
  // `bottomInset` (needed only while the keyboard is hidden) on top of that
  // padding left a visible gap between the input and the keyboard.
  const keyboardVisible = useKeyboardVisible();
  const resolvedBottomInset = keyboardVisible ? 0 : bottomInset;

  const submitFreeText = (): void => {
    if (!canSend) return;
    onSubmit(chatInput.trim());
  };

  const closeAssistant = (): void => {
    Keyboard.dismiss();
    onCollapse();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {expanded ? (
        <View style={{ borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }}>
          <View style={styles.transcriptHeader}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.assistantBadge}
            >
              <Ionicons name="sparkles" size={sizes.iconSm} color={colors.primaryText} />
            </LinearGradient>
            <View style={styles.transcriptHeaderText}>
              <ThemedText style={[styles.assistantName, { color: colors.text }]}>
                {t().createRecipe.assistant}
              </ThemedText>
              <ThemedText variant="caption" style={{ color: colors.textMuted }}>
                {t().createRecipe.refineHint}
              </ThemedText>
            </View>
            <Pressable
              onPress={closeAssistant}
              hitSlop={8}
              style={styles.collapseBtn}
              accessibilityRole="button"
              accessibilityLabel={t().createRecipe.closeAssistant}
            >
              <Ionicons name="close" size={sizes.iconSm} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.transcript}
            contentContainerStyle={styles.transcriptInner}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {chatHistory.map((message, i) => {
              const isUser = message.role === 'user';
              const bubbleColor = isUser
                ? colors.primary
                : message.error
                  ? colors.dangerLight
                  : colors.chipBackground;
              const textColor = isUser
                ? colors.primaryText
                : message.error
                  ? colors.danger
                  : colors.text;
              return (
                <View
                  key={`${i}-${message.role}`}
                  style={[
                    styles.bubble,
                    {
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      backgroundColor: bubbleColor,
                    },
                  ]}
                >
                  <ThemedText style={[styles.bubbleText, { color: textColor }]}>
                    {message.content}
                  </ThemedText>
                </View>
              );
            })}
            {refining ? (
              <View style={[styles.bubble, styles.thinkingBubble, { alignSelf: 'flex-start', backgroundColor: colors.chipBackground }]}>
                <ThemedText style={[styles.bubbleText, styles.thinking, { color: colors.textMuted }]}>
                  {t().createRecipe.refining}
                </ThemedText>
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={onRegenerate}
          disabled={!canRegenerate || refining}
          style={[
            styles.regenChip,
            { borderColor: colors.primary, opacity: canRegenerate && !refining ? 1 : 0.45 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t().createRecipe.regenerate}
        >
          <Ionicons name="refresh" size={sizes.iconSm} color={colors.primary} />
          <ThemedText variant="caption" style={[styles.regenLabel, { color: colors.primary }]}>
            {t().createRecipe.regenerate}
          </ThemedText>
        </Pressable>
        {QUICK_CHIP_KEYS.map((key) => {
          const label = t().createRecipe[key];
          return (
            <Pressable
              key={key}
              onPress={() => onSubmit(label)}
              disabled={refining}
              style={[
                styles.quickChip,
                { borderColor: colors.border, backgroundColor: colors.background, opacity: refining ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <ThemedText variant="caption" style={[styles.quickChipLabel, { color: colors.text }]}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.inputRow, { paddingBottom: resolvedBottomInset + spacing.md }]}>
        <View style={[styles.inputField, { backgroundColor: colors.background, borderColor: colors.inputBorder }]}>
          <Ionicons name="sparkles" size={sizes.iconSm} color={colors.primary} />
          <TextInput
            value={chatInput}
            onChangeText={onChangeChatInput}
            onFocus={onExpand}
            placeholder={t().createRecipe.refinePlaceholder}
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={submitFreeText}
            returnKeyType="send"
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable
            onPress={submitFreeText}
            disabled={!canSend}
            style={[styles.sendBtn, { backgroundColor: canSend ? colors.primary : colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.refinePlaceholder}
          >
            <Ionicons name="arrow-up" size={sizes.iconSm} color={colors.primaryText} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  assistantBadge: {
    width: sizes.badgeSm,
    height: sizes.badgeSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptHeaderText: {
    flex: 1,
  },
  assistantName: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  collapseBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcript: {
    maxHeight: 200,
  },
  transcriptInner: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
  },
  thinkingBubble: {},
  bubbleText: {
    fontSize: fontSizes.caption,
    lineHeight: 19,
  },
  thinking: {
    fontStyle: 'italic',
  },
  chipScroll: {
    gap: spacing.xs2,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  regenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  regenLabel: {
    fontWeight: '700',
    fontSize: fontSizes.small,
  },
  quickChip: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipLabel: {
    fontWeight: '600',
    fontSize: fontSizes.small,
  },
  inputRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: sizes.searchBarHeight,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.medium,
    paddingVertical: 0,
  },
  sendBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
