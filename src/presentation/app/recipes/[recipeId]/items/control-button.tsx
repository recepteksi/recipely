import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, sizes } from '@presentation/base/theme';
import { OpacityConstants } from '@presentation/base/constants';

interface ControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  iconColor: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const ControlButton = ({
  icon,
  bg,
  iconColor,
  label,
  onPress,
  disabled,
}: ControlButtonProps): React.JSX.Element => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.ctrlBtn,
      {
        backgroundColor: bg,
        opacity: disabled
          ? OpacityConstants.inactive
          : pressed
            ? OpacityConstants.pressedStrong
            : OpacityConstants.full,
      },
    ]}
  >
    <Ionicons name={icon} size={sizes.iconSm} color={iconColor} />
  </Pressable>
);

const styles = StyleSheet.create({
  ctrlBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
