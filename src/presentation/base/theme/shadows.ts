import { Platform, type ViewStyle } from 'react-native';
import { ValueConstants } from '@core/constants';

export const shadows = {
  sm: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 2 },
    default: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  }) ?? {},
  md: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
    android: { elevation: 4 },
    default: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
  }) ?? {},
  lg: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24 },
    android: { elevation: 8 },
    default: { shadowColor: '#000', shadowOffset: { width: ValueConstants.zero, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24 },
  }) ?? {},
} as const;
