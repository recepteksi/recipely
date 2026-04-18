import type { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@presentation/base/theme/theme-context';

export interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
  padded?: boolean;
}

export const ScreenContainer = ({
  children,
  scrollable = false,
  refreshing,
  onRefresh,
  contentStyle,
  padded = true,
}: ScreenContainerProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const padStyle = padded ? styles.padded : undefined;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, padStyle, contentStyle]}
          refreshControl={
            onRefresh !== undefined ? (
              <RefreshControl refreshing={refreshing === true} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.flex, padStyle, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  padded: {
    padding: 16,
  },
});
