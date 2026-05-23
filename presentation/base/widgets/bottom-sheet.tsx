import { type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  hideCloseButton?: boolean;
  rightAction?: { label: string; onPress: () => void };
  children: ReactNode;
}

/** Modal bottom sheet with a grabber, header, optional close button, and scrollable content area. */
export const BottomSheet = ({
  visible,
  title,
  onClose,
  hideCloseButton = false,
  rightAction,
  children,
}: BottomSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <View style={styles.grabberWrap}>
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
          </View>
          <View style={styles.header}>
            {hideCloseButton ? (
              <View style={styles.headerSide} />
            ) : (
              <Pressable onPress={onClose} hitSlop={8} style={styles.headerSide}>
                <ThemedText variant="body" muted>×</ThemedText>
              </Pressable>
            )}
            <ThemedText variant="subtitle">{title}</ThemedText>
            {rightAction !== undefined ? (
              <Pressable
                onPress={rightAction.onPress}
                hitSlop={8}
                style={[styles.headerSide, styles.headerRight]}
              >
                <ThemedText
                  variant="body"
                  style={[styles.rightActionLabel, { color: colors.primary }]}
                >
                  {rightAction.label}
                </ThemedText>
              </Pressable>
            ) : (
              <View style={[styles.headerSide, styles.headerRight]} />
            )}
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '78%',
  },
  grabberWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  grabber: {
    width: sizes.iconBtn,
    height: spacing.xs,
    borderRadius: radii.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSide: {
    minWidth: 50,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  rightActionLabel: {
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
