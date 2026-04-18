import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AppBootstrap } from '@presentation/bootstrap/app-bootstrap';
import { initLocale, t } from '@presentation/i18n';

initLocale();

export const RootLayout = (): React.JSX.Element => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppBootstrap>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="recipes/index" options={{ title: t().navigation.recipes }} />
          <Stack.Screen
            name="recipes/[recipeId]/index"
            options={{ title: t().navigation.recipe }}
          />
          <Stack.Screen
            name="recipes/[recipeId]/tasks/index"
            options={{ title: t().navigation.tasks }}
          />
          <Stack.Screen
            name="recipes/[recipeId]/tasks/[taskId]"
            options={{ title: t().navigation.task }}
          />
        </Stack>
      </AppBootstrap>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};
