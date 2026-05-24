import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AppBootstrap } from '@presentation/bootstrap/app-bootstrap';
import { AppThemeProvider, useTheme } from '@presentation/base/theme/theme-context';
import { ActiveTimersBar } from '@presentation/base/widgets/active-timers-bar';
import { AlarmScreen } from '@presentation/screens/alarm/alarm-screen';
import { alarmStore } from '@application/timers/alarm-store';
import { initLocale } from '@presentation/i18n';

initLocale();

/** Full-screen overlay that appears whenever `alarmStore` has an active alarm. */
const AlarmOverlay = (): React.JSX.Element | null => {
  const activeAlarm = alarmStore((s) => s.activeAlarm);
  if (activeAlarm === null) return null;
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <AlarmScreen timerId={activeAlarm.timerId} recipeName={activeAlarm.recipeName} />
    </View>
  );
};

const RootStack = (): React.JSX.Element => {
  const { scheme, colors } = useTheme();

  const reactNavTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const headerBg = colors.background;
  const headerTint = colors.text;

  return (
    <ThemeProvider value={reactNavTheme}>
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
        <Stack.Screen name="recipes/index" options={{ headerShown: false }} />
        <Stack.Screen name="recipes/[recipeId]/index" options={{ headerShown: false }} />
        <Stack.Screen name="my-recipes" options={{ headerShown: false }} />
        <Stack.Screen name="create-recipe" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
      <ActiveTimersBar />
      <AlarmOverlay />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export const RootLayout = (): React.JSX.Element => {
  return (
    <AppThemeProvider>
      <AppBootstrap>
        <RootStack />
      </AppBootstrap>
    </AppThemeProvider>
  );
};
