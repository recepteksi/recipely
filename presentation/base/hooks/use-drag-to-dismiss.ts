import { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, type PanResponderInstance } from 'react-native';
import { shouldDismissDrag } from '@presentation/base/utils/should-dismiss-drag';

const SNAP_BACK_DURATION_MS = 200;

export interface UseDragToDismissResult {
  /** Vertical offset to apply as the sheet's `transform: [{ translateY }]`. */
  translateY: Animated.Value;
  /** Spread onto the draggable node, e.g. `<View {...panHandlers}>`. */
  panHandlers: PanResponderInstance['panHandlers'];
}

/**
 * Drag-to-dismiss gesture for a bottom sheet, built on React Native's core
 * `PanResponder`/`Animated` (no gesture-handler root-view wiring required,
 * since nothing else in this app currently relies on
 * `react-native-gesture-handler`'s `GestureDetector`).
 *
 * The release decision (tap vs. cleared-threshold drag vs. snap-back) lives
 * in the pure, independently-tested `shouldDismissDrag` — this hook is just
 * the `PanResponder`/`Animated` plumbing around it. Dragging upward is
 * clamped to 0 (can't pull the sheet past its resting position).
 * `translateY` resets to 0 whenever `visible` becomes true, so a sheet
 * dismissed mid-drag re-opens from a clean position.
 */
export const useDragToDismiss = (onClose: () => void, visible: boolean): UseDragToDismissResult => {
  const translateY = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  const snapBack = (): void => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: SNAP_BACK_DURATION_MS,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_event, gestureState) => {
          translateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (shouldDismissDrag(gestureState)) {
            onCloseRef.current();
            return;
          }
          snapBack();
        },
        onPanResponderTerminate: snapBack,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapBack/translateY are stable refs; onClose is read via onCloseRef.
    [translateY],
  );

  return { translateY, panHandlers: panResponder.panHandlers };
};
