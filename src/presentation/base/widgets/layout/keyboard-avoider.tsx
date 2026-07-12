import { KeyboardAvoidingView, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

export interface KeyboardAvoiderProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra offset (e.g. a header height) added to the avoided keyboard area. */
  keyboardVerticalOffset?: number;
}

/**
 * Keeps focused inputs visible above the software keyboard on both platforms.
 *
 * Uses `behavior="padding"` for iOS AND Android. Android historically relied on
 * the manifest's `windowSoftInputMode="adjustResize"` and passed `behavior={undefined}`,
 * but Expo SDK 54 / RN 0.81 edge-to-edge (`android.edgeToEdgeEnabled: true`) makes
 * Android ignore `adjustResize` — so the legacy `undefined`-on-Android pattern leaves
 * inputs hidden behind the keyboard. JS-side padding is now required on Android too.
 */
export const KeyboardAvoider = ({
  children,
  style,
  keyboardVerticalOffset,
}: KeyboardAvoiderProps): React.JSX.Element => (
  <KeyboardAvoidingView
    style={style}
    behavior="padding"
    keyboardVerticalOffset={keyboardVerticalOffset}
  >
    {children}
  </KeyboardAvoidingView>
);
