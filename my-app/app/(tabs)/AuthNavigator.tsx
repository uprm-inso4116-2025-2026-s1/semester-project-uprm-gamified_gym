import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './authContext';
import { useRouter, useSegments } from 'expo-router';

export function AuthNavigator({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const currentScreen = segments[1];

    // Auth screens that should be accessible when not logged in
    const authScreens = ['Login', 'SignUp', 'Password', 'resetPassword'];
    const onAuthScreen = authScreens.includes(currentScreen);

    if (!isAuthenticated && !onAuthScreen) {
      // Redirect to login if not authenticated and not on an auth screen
      router.replace('/(tabs)/Login');
    } else if (isAuthenticated && onAuthScreen) {
      // Redirect to exercises if already authenticated and on an auth screen
      router.replace('/(tabs)/ExerciseLibrary');
    }
  }, [isAuthenticated, loading, segments, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E89FF" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
