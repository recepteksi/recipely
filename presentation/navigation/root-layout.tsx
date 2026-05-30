import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AppBootstrap } from '@presentation/bootstrap/app-bootstrap';
import { AppThemeProvider, useTheme } from '@presentation/base/theme/theme-context';
import { LayoutProvider, useLayout } from '@presentation/base/responsive/layout-context';
import { WebShellStateProvider } from '@presentation/base/responsive/web-shell-state';
import { ActiveTimersBar } from '@presentation/base/widgets/active-timers-bar';
import { SplashOverlay } from '@presentation/base/widgets/splash-overlay';
import { WebHeader } from '@presentation/base/widgets/web-header/web-header';
import { AlarmScreen } from '@presentation/screens/alarm/alarm-screen';
import { alarmStore } from '@application/timers/alarm-store';
import { initLocale } from '@presentation/i18n';

initLocale();

/** Full-screen overlay that appears whenever `alarmStore` has an active alarm. */
const AlarmOverlay = (): React.JSX.Element | null => {
  const activeAlarm = alarmStore((s) => s.activeAlarm);
  if (activeAlarm === null) return null;
  return (
    // zIndex must exceed ActiveTimersBar (100) so the alarm sits on top.
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 201 }]}>
      <AlarmScreen timerId={activeAlarm.timerId} recipeName={activeAlarm.recipeName} />
    </View>
  );
};

const AUTH_PATHS = new Set<string>([
  '/login',
  '/register',
  '/verify-code',
  '/forgot-password',
  '/',
]);

/**
 * Decides whether the sticky WebHeader should render. Auth screens own their
 * own split-pane chrome and skip the header. Everything else uses it as soon
 * as the LayoutProvider switches into the web shell breakpoint.
 */
const useShouldRenderWebHeader = (): boolean => {
  const { isWebShell } = useLayout();
  const pathname = usePathname();
  if (!isWebShell) return false;
  return !AUTH_PATHS.has(pathname);
};

const WebShellChrome = (): React.JSX.Element | null => {
  const show = useShouldRenderWebHeader();
  if (!show) return null;
  return <WebHeader />;
};

const RootStack = (): React.JSX.Element => {
  const { scheme, colors } = useTheme();

  const reactNavTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const headerBg = colors.background;
  const headerTint = colors.text;

  return (
    <ThemeProvider value={reactNavTheme}>
      <WebShellChrome />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerTint,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="verify-code" options={{ headerShown: false }} />
        <Stack.Screen name="recipes/index" options={{ headerShown: false }} />
        <Stack.Screen name="recipes/[recipeId]/index" options={{ headerShown: false }} />
        <Stack.Screen name="my-recipes" options={{ headerShown: false }} />
        <Stack.Screen name="create-recipe" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="ai-generate" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
      <ActiveTimersBar />
      <AlarmOverlay />
      <SplashOverlay />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export const RootLayout = (): React.JSX.Element => {
  return (
    <AppThemeProvider>
      <LayoutProvider>
        <WebShellStateProvider>
          <AppBootstrap>
            <RootStack />
          </AppBootstrap>
        </WebShellStateProvider>
      </LayoutProvider>
    </AppThemeProvider>
  );
};
