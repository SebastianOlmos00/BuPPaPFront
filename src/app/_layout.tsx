import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { SessionProvider } from '@/services/session';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SessionProvider>
      <ThemeProvider
        value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(guest)" />
          <Stack.Screen name="(user)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(driver)" />
        </Stack>
      </ThemeProvider>
    </SessionProvider>
  );
}