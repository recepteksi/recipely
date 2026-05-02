import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppBootstrap } from '@presentation/bootstrap/app-bootstrap';
import { AppThemeProvider, useTheme } from '@presentation/base/theme/theme-context';
import { initLocale, t } from '@presentation/i18n';

initLocale();

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
        <Stack.Screen
          name="recipes/index"
          options={{ title: t().navigation.recipes }}
        />
        <Stack.Screen
          name="recipes/[recipeId]/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="recipes/[recipeId]/tasks/index"
          options={{ title: t().navigation.tasks }}
        />
        <Stack.Screen
          name="recipes/[recipeId]/tasks/[taskId]"
          options={{ title: t().navigation.task }}
        />
        <Stack.Screen
          name="my-recipes"
          options={{ title: t().navigation.myRecipes, headerBackVisible: false }}
        />
        <Stack.Screen
          name="create-recipe"
          options={{ title: t().createRecipe.title }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: t().navigation.settings, headerBackVisible: false }}
        />
      </Stack>
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
