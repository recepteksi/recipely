import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { spacing } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

export type StateViewStatus = 'loading' | 'error' | 'empty' | 'content';

export interface StateViewProps {
  status: StateViewStatus;
  failure?: Failure;
  onRetry?: () => void;
  emptyMessage?: string;
  children?: ReactNode;
}

/** Renders loading, error, empty, or content branches based on the discriminated `status` prop. */
export const StateView = ({
  status,
  failure,
  onRetry,
  emptyMessage = 'Nothing to show.',
  children,
}: StateViewProps): React.JSX.Element => {
  switch (status) {
    case 'loading':
      return (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      );
    case 'error':
      return (
        <View style={styles.center}>
          <ThemedText variant="subtitle">Something went wrong</ThemedText>
          <ThemedText variant="body" muted style={styles.message}>
            {failure?.message ?? 'Unknown error'}
          </ThemedText>
          {onRetry !== undefined ? (
            <View style={styles.retry}>
              <PrimaryButton label="Retry" onPress={onRetry} />
            </View>
          ) : null}
        </View>
      );
    case 'empty':
      return (
        <View style={styles.center}>
          <ThemedText variant="body" muted>
            {emptyMessage}
          </ThemedText>
          {onRetry !== undefined ? (
            <View style={styles.retry}>
              <PrimaryButton label="Refresh" onPress={onRetry} />
            </View>
          ) : null}
        </View>
      );
    case 'content':
      return <>{children}</>;
  }
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.lg,
  },
});
