import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ExerciseItem } from './exerciseStore';

// Types matching your Supabase schema
export type WorkoutExercise = {
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: {
    reps: number;
    weight?: number;
    completed: boolean;
  }[];
};

export type WorkoutSession = {
  id: string;
  user_id?: string;
  workout_name: string;
  exercises: WorkoutExercise[];
  date_completed: string;
};

type WorkoutContextType = {
  workoutHistory: WorkoutSession[];
  currentWorkout: WorkoutSession | null;
  loading: boolean;
  startWorkout: () => void;
  endWorkout: (notes?: string) => Promise<void>;
  addExerciseToWorkout: (exercise: ExerciseItem) => void;
  updateExerciseSet: (exerciseId: string, setIndex: number, reps: number, weight?: number) => void;
  toggleSetComplete: (exerciseId: string, setIndex: number) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  getWorkoutStats: () => {
    totalWorkouts: number;
    totalExercises: number;
    currentStreak: number;
    lastWorkoutDate: string | null;
  };
  refreshWorkouts: () => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProviderSupabase({ children }: { children: ReactNode }) {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Load workout history from Supabase
  const loadWorkoutHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No authenticated user');
        setWorkoutHistory([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('workouts_test')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });

      if (error) {
        console.error('Error loading workouts:', error);
        return;
      }

      if (data) {
        // Transform Supabase data to match our WorkoutSession type
        const workouts: WorkoutSession[] = data.map((workout) => ({
          id: workout.id,
          user_id: workout.user_id,
          workout_name: workout.workout_name,
          exercises: workout.exercises as WorkoutExercise[],
          date_completed: workout.date_completed,
        }));
        setWorkoutHistory(workouts);
      }
    } catch (error) {
      console.error('Failed to load workout history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load workouts on mount
  useEffect(() => {
    loadWorkoutHistory();
  }, [loadWorkoutHistory]);

  const startWorkout = () => {
    const newWorkout: WorkoutSession = {
      id: `temp-${Date.now()}`,
      user_id: userId || undefined,
      workout_name: 'Quick Workout',
      exercises: [],
      date_completed: new Date().toISOString(),
    };
    setCurrentWorkout(newWorkout);
  };

  const endWorkout = async (notes?: string) => {
    if (!currentWorkout) return;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('No authenticated user', authError);
        throw new Error('You must be logged in to save workouts. Please sign in and try again.');
      }

      // Prepare workout data for Supabase
      const workoutData = {
        user_id: user.id,  // ← User ID saved here
        workout_name: notes || currentWorkout.workout_name,
        exercises: currentWorkout.exercises,
        date_completed: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('workouts_test')
        .insert([workoutData])
        .select()
        .single();

      if (error) {
        console.error('Error saving workout:', error);
        throw new Error(`Failed to save workout: ${error.message}`);
      }

      if (data) {
        // Add to local state
        const completedWorkout: WorkoutSession = {
          id: data.id,
          user_id: data.user_id,
          workout_name: data.workout_name,
          exercises: data.exercises as WorkoutExercise[],
          date_completed: data.date_completed,
        };

        setWorkoutHistory((prev) => [completedWorkout, ...prev]);
      }

      setCurrentWorkout(null);
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw error; // Re-throw so ExerciseDetail can handle it
    }
  };

  const addExerciseToWorkout = (exercise: ExerciseItem) => {
    if (!currentWorkout) return;

    const workoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: Array.from({ length: exercise.sets }, () => ({
        reps: exercise.reps,
        completed: false,
      })),
    };

    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, workoutExercise],
    });
  };

  const updateExerciseSet = (exerciseId: string, setIndex: number, reps: number, weight?: number) => {
    if (!currentWorkout) return;

    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((ex) =>
        ex.exerciseId === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) =>
                idx === setIndex ? { ...set, reps, weight } : set
              ),
            }
          : ex
      ),
    });
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    if (!currentWorkout) return;

    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((ex) =>
        ex.exerciseId === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) =>
                idx === setIndex ? { ...set, completed: !set.completed } : set
              ),
            }
          : ex
      ),
    });
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    if (!currentWorkout) return;

    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter((ex) => ex.exerciseId !== exerciseId),
    });
  };

  const getWorkoutStats = () => {
    const totalWorkouts = workoutHistory.length;
    const totalExercises = workoutHistory.reduce(
      (sum, workout) => sum + workout.exercises.length,
      0
    );

    // Calculate current streak
    let currentStreak = 0;
    const sortedWorkouts = [...workoutHistory].sort(
      (a, b) => new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date_completed);
      workoutDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && daysDiff > 1) {
        // If last workout was more than 1 day ago, streak is broken
        break;
      }

      if (daysDiff === i || (i === 0 && daysDiff === 0)) {
        currentStreak++;
      } else {
        break;
      }
    }

    const lastWorkoutDate = sortedWorkouts.length > 0 ? sortedWorkouts[0].date_completed : null;

    return {
      totalWorkouts,
      totalExercises,
      currentStreak,
      lastWorkoutDate,
    };
  };

  const refreshWorkouts = async () => {
    await loadWorkoutHistory();
  };

  return (
    <WorkoutContext.Provider
      value={{
        workoutHistory,
        currentWorkout,
        loading,
        startWorkout,
        endWorkout,
        addExerciseToWorkout,
        updateExerciseSet,
        toggleSetComplete,
        removeExerciseFromWorkout,
        getWorkoutStats,
        refreshWorkouts,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutsSupabase() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutsSupabase must be used within WorkoutProviderSupabase');
  }
  return context;
}
