import { useRef, useState, useCallback } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii } from '@presentation/base/theme';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  style?: StyleProp<ViewStyle>;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const snap = (value: number, step: number): number =>
  step > 0 ? Math.round(value / step) * step : value;

/** Custom pan-gesture slider with configurable min, max, and step values. */
export const Slider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  style,
}: SliderProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [trackWidth, setTrackWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent): void => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  const range = Math.max(max - min, 1);
  const fillRatio = trackWidth > 0 ? clamp((value - min) / range, 0, 1) : 0;

  const valueFromX = useCallback(
    (x: number): number => {
      if (trackWidth <= 0) return value;
      const ratio = clamp(x / trackWidth, 0, 1);
      const raw = min + ratio * range;
      return clamp(snap(raw, step), min, max);
    },
    [trackWidth, value, min, range, step, max],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const next = valueFromX(evt.nativeEvent.locationX);
        if (next !== value) onChange(next);
      },
      onPanResponderMove: (evt) => {
        const next = valueFromX(evt.nativeEvent.locationX);
        if (next !== value) onChange(next);
      },
    }),
  ).current;

  const handleSize = 20;
  const trackHeight = 4;

  return (
    <View
      style={[styles.container, style]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.border,
            height: trackHeight,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${fillRatio * 100}%`,
              height: trackHeight,
            },
          ]}
        />
      </View>
      {trackWidth > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.handle,
            {
              width: handleSize,
              height: handleSize,
              borderRadius: handleSize / 2,
              backgroundColor: colors.primary,
              borderColor: colors.surface,
              shadowColor: colors.shadow,
              left: clamp(
                fillRatio * trackWidth - handleSize / 2,
                -handleSize / 2,
                trackWidth - handleSize / 2,
              ),
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 28,
    justifyContent: 'center',
    width: '100%',
  },
  track: {
    width: '100%',
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.round,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
    borderWidth: 2,
    elevation: 2,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
});
