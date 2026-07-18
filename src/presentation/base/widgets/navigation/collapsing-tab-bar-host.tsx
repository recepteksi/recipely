import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { durations } from '@presentation/base/theme';
import { TabBar } from '@presentation/base/widgets/navigation/tab-bar';
import type { TabBarKey } from '@presentation/base/widgets/navigation/tab-bar-key';

export interface CollapsingTabBarHostProps {
  state: { active: TabBarKey; onChange: (key: TabBarKey) => void } | null;
}

/**
 * Hosts the root TabBar, which lives OUTSIDE the expo-router Stack as a flex
 * sibling. Because visibility is pathname-driven, an instant unmount when
 * pushing a tab-less route (e.g. /create-recipe) would grow the content area
 * by the bar's height in a single frame while the slide transition is still
 * running — the outgoing screen visibly jumps. Instead, this host keeps the
 * last-known bar mounted inside an overflow-hidden container and animates its
 * height to 0 (and back), timed to the stack push transition; the child is
 * unmounted only after the collapse completes so no interactive bar lingers
 * at height 0.
 *
 * The bar's natural height depends on the safe-area bottom inset, so it is
 * measured via onLayout rather than hardcoded; while fully visible the host
 * renders unclipped (auto height), which also keeps the first mount flash-free
 * and lets TabBar's own web-shell self-hiding work untouched.
 */
export const CollapsingTabBarHost = ({
  state,
}: CollapsingTabBarHostProps): React.JSX.Element | null => {
  const lastStateRef = useRef(state);
  if (state !== null) lastStateRef.current = state;

  const [phase, setPhase] = useState<'visible' | 'collapsing' | 'expanding' | 'hidden'>(
    state !== null ? 'visible' : 'hidden',
  );
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const height = useSharedValue(0);
  const visible = state !== null;

  useEffect(() => {
    if (visible) {
      if (phase === 'visible' || phase === 'expanding') return;
      if (naturalHeight === null) {
        setPhase('visible'); // never measured — snap open, no first-mount flash
        return;
      }
      height.value = withTiming(
        naturalHeight,
        { duration: durations.tabBarToggleMs },
        (finished) => {
          if (finished === true) runOnJS(setPhase)('visible');
        },
      );
      setPhase('expanding');
      return;
    }
    if (phase === 'hidden' || phase === 'collapsing') return;
    if (naturalHeight === null) {
      setPhase('hidden'); // never measured — snap closed
      return;
    }
    if (phase === 'visible') height.value = naturalHeight; // was auto height until now
    height.value = withTiming(0, { duration: durations.tabBarToggleMs }, (finished) => {
      if (finished === true) runOnJS(setPhase)('hidden');
    });
    setPhase('collapsing');
  }, [visible, phase, naturalHeight, height]);

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));

  if (phase === 'hidden') return null;

  const shown = lastStateRef.current;
  if (shown === null) return null;

  const onLayout = (event: LayoutChangeEvent): void => {
    const measured = event.nativeEvent.layout.height;
    // 0 means the TabBar self-hid on the web-shell breakpoint. Forget the
    // previously measured height so later visibility toggles snap instead of
    // animating a transparent 68px ghost strip open/closed. Native never hits
    // this: the measuring wrapper keeps its natural height during collapse
    // (only the outer container clips) and TabBar itself never renders null.
    if (measured === 0) {
      setNaturalHeight(null);
      return;
    }
    if (measured !== naturalHeight) setNaturalHeight(measured);
  };

  return (
    <Animated.View
      // The collapsing bar renders a stale onChange closure (pre-navigation
      // pathname) — block hit-testing until it is gone.
      pointerEvents={phase === 'collapsing' ? 'none' : 'auto'}
      style={phase === 'visible' ? null : [styles.clip, animatedStyle]}
    >
      <View onLayout={onLayout}>
        <TabBar active={shown.active} onChange={shown.onChange} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
