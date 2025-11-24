import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from './(tabs)/authContext';
import { AuthNavigator } from './(tabs)/AuthNavigator';
import { ExerciseProvider } from './(tabs)/exerciseStore';
import { WorkoutProviderSupabase } from './(tabs)/workoutStoreSupabase';
import { AchievementProviderSupabase } from './(tabs)/achievementStoreSupabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ExerciseProvider>
        <WorkoutProviderSupabase>
          <AchievementProviderSupabase>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AuthNavigator>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </AuthNavigator>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AchievementProviderSupabase>
        </WorkoutProviderSupabase>
      </ExerciseProvider>
    </AuthProvider>
  );
}
