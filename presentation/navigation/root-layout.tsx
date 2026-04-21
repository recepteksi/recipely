import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppBootstrap } from '@presentation/bootstrap/app-bootstrap';
import { AppThemeProvider, useTheme } from '@presentation/base/theme/theme-context';
import { initLocale, t } from '@presentation/i18n';

initLocale();

const RootStack = (): React.JSX.Element => {
  const { scheme, colors } = useTheme();
  const router = useRouter();

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
          options={{
            title: t().navigation.recipes,
            headerRight: () => (
              <Pressable onPress={() => router.push('/settings')} style={{ marginRight: 8 }}>
                <Ionicons name="settings-outline" size={22} color={colors.text} />
              </Pressable>
            ),
          }}
        />
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
        <Stack.Screen name="settings" options={{ title: t().navigation.settings }} />
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
