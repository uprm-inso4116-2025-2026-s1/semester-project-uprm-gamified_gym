import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from './authContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E89FF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: isAuthenticated ? {
          position: 'absolute',
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        } : {
          display: 'none', // Hide tab bar when not authenticated
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      {/* Main Tab: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Main Tab: Exercises */}
      <Tabs.Screen
        name="ExerciseLibrary"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.strengthtraining.traditional" color={color} />,
        }}
      />

      {/* Main Tab: Profile */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />

      {/* Main Tab: Achievements */}
      <Tabs.Screen
        name="Achievements"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />

      {/* Main Tab: Workout History */}
      <Tabs.Screen
        name="WorkoutHistory"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />

      {/* Hidden Screen: Home (old) */}
      <Tabs.Screen
        name="Home"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Settings */}
      <Tabs.Screen
        name="Settings"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Create Exercise */}
      <Tabs.Screen
        name="CreateExercise"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Exercise Detail */}
      <Tabs.Screen
        name="ExerciseDetail"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Exercise Management (old) */}
      <Tabs.Screen
        name="ExerciseManagement"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Exercise Log */}
      <Tabs.Screen
        name="ExerciseLog"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Add Workout */}
      <Tabs.Screen
        name="AddWorkout"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Explore (optional) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Password */}
      <Tabs.Screen
        name="Password"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Login */}
      <Tabs.Screen
        name="Login"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Sign Up */}
      <Tabs.Screen
        name="SignUp"
        options={{
          href: null,
        }}
      />

      {/* Hidden Screen: Reset Password */}
      <Tabs.Screen
        name="resetPassword"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Auth Context */}
      <Tabs.Screen
        name="authContext"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Auth Navigator */}
      <Tabs.Screen
        name="AuthNavigator"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Exercise Store Provider */}
      <Tabs.Screen
        name="exerciseStore"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Workout Store Supabase */}
      <Tabs.Screen
        name="workoutStore"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Workout Store Supabase */}
      <Tabs.Screen
        name="workoutStoreSupabase"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Achievement Store */}
      <Tabs.Screen
        name="achievementStore"
        options={{
          href: null,
        }}
      />

      {/* Hidden: Achievement Store Supabase */}
      <Tabs.Screen
        name="achievementStoreSupabase"
        options={{
          href: null,
        }}
      />

      {/* Hidden: App */}
      <Tabs.Screen
        name="App"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
