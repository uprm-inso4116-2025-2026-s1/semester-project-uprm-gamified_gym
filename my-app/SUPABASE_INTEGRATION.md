# Supabase Integration Guide

## Database Schema (Already Implemented)

### 1. User Profiles Table
```sql
CREATE TABLE public.user_profiles_test (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  weight numeric,
  height numeric,
  gender text,
  bio text,
  date_of_birth date,
  profile_picture_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  first_name text,
  last_name text,
  CONSTRAINT user_profiles_test_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_test_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

### 2. Workouts Table
```sql
CREATE TABLE public.workouts_test (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  workout_name text NOT NULL,
  exercises jsonb NOT NULL,
  date_completed timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT workouts_test_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_test_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles_test(id)
);
```

## Optional: Achievement Tracking Table

If you want to persist achievement progress in the database:

```sql
-- Achievements tracking table
CREATE TABLE public.user_achievements_test (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  progress integer DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_test_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_test_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles_test(id),
  CONSTRAINT user_achievements_test_unique UNIQUE (user_id, achievement_id)
);

-- Index for faster queries
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements_test(user_id);
```

## Row Level Security (RLS) Policies

### Enable RLS on tables:
```sql
ALTER TABLE public.workouts_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements_test ENABLE ROW LEVEL SECURITY;
```

### Policies for workouts_test:
```sql
-- Users can view their own workouts
CREATE POLICY "Users can view own workouts"
  ON public.workouts_test
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can insert own workouts"
  ON public.workouts_test
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON public.workouts_test
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON public.workouts_test
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Policies for user_achievements_test (if using):
```sql
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements_test
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements_test
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own achievements
CREATE POLICY "Users can update own achievements"
  ON public.user_achievements_test
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## Integration Steps

### Step 1: Update App Layout

Replace the providers in `app/_layout.tsx`:

```tsx
import { WorkoutProviderSupabase } from './(tabs)/workoutStoreSupabase';
import { AchievementProviderSupabase } from './(tabs)/achievementStoreSupabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ExerciseProvider>
      <WorkoutProviderSupabase>
        <AchievementProviderSupabase>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AchievementProviderSupabase>
      </WorkoutProviderSupabase>
    </ExerciseProvider>
  );
}
```

### Step 2: Update ExerciseDetail

In `app/(tabs)/ExerciseDetail.tsx`, change the import:

```tsx
// Change from:
import { useWorkouts } from "./workoutStore";

// To:
import { useWorkoutsSupabase as useWorkouts } from "./workoutStoreSupabase";
```

### Step 3: Update Achievements Page

In `app/(tabs)/Achievements.tsx`, change the import:

```tsx
// Change from:
import { useAchievements } from "./achievementStore";

// To:
import { useAchievementsSupabase as useAchievements } from "./achievementStoreSupabase";
```

### Step 4: Update Type Imports

Also update the type imports in `Achievements.tsx`:

```tsx
// Change from:
import type { Achievement, AchievementCategory } from "./achievementStore";

// To:
import type { Achievement, AchievementCategory } from "./achievementStoreSupabase";
```

## Data Structure

### Workout Exercise Format (JSONB in workouts_test.exercises)

```json
[
  {
    "exerciseId": "ex-123456",
    "exerciseName": "Running",
    "category": "Cardio",
    "sets": [
      {
        "reps": 1,
        "weight": 0,
        "completed": true
      }
    ]
  }
]
```

## Testing

1. **Sign in a user** - Make sure you have authentication working
2. **Log an exercise** - Go to Exercise Library → Select Exercise → Log Workout
3. **Check Supabase** - Verify the workout appears in `workouts_test` table
4. **View Achievements** - Check that achievements update based on logged workouts

## Benefits of Supabase Integration

✅ **Data Persistence** - Workouts saved to cloud database
✅ **Multi-Device Sync** - Access your data from any device
✅ **User Accounts** - Each user has their own workout history
✅ **Real-time Updates** - Changes sync automatically
✅ **Scalability** - Database handles growth automatically
✅ **Backup & Recovery** - Supabase handles data backups

## Troubleshooting

### No workouts showing up?
- Check that user is authenticated: `supabase.auth.getUser()`
- Verify RLS policies are set up correctly
- Check browser console for errors

### Authentication errors?
- Verify Supabase URL and anon key in `.env` file
- Make sure user is signed in before accessing workouts

### Database connection issues?
- Check network connectivity
- Verify Supabase project is active
- Check API rate limits
