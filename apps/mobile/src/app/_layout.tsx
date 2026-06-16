import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SessionProvider, useSession } from '@/hooks/use-session';

function RootNavigator() {
  const { session, isLoading } = useSession();

  // Wait for the stored session to load before deciding which stack to show,
  // so we don't flash the auth screens at an already signed-in user.
  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-review" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Password recovery hands the user a temporary session, so this route
          stays outside both guards — otherwise the signed-in guard would
          redirect it into the app before they can set a new password. */}
      <Stack.Screen name="update-password" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </ThemeProvider>
    </SessionProvider>
  );
}
