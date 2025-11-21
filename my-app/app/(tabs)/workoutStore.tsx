import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseItem } from './exerciseStore';

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
  date: string;
  startTime: string;
  endTime?: string;
  exercises: WorkoutExercise[];
  notes?: string;
  duration?: number; // in minutes
};

type WorkoutContextType = {
  workoutHistory: WorkoutSession[];
  currentWorkout: WorkoutSession | null;
  startWorkout: () => void;
  endWorkout: (notes?: string) => void;
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
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const WORKOUT_STORAGE_KEY = '@workout_history';

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);

  // Load workout history from storage
  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  // Save workout history whenever it changes
  useEffect(() => {
    if (workoutHistory.length > 0) {
      saveWorkoutHistory();
    }
  }, [workoutHistory]);

  const loadWorkoutHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
      if (stored) {
        setWorkoutHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load workout history:', error);
    }
  };

  const saveWorkoutHistory = async () => {
    try {
      await AsyncStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workoutHistory));
    } catch (error) {
      console.error('Failed to save workout history:', error);
    }
  };

  const startWorkout = () => {
    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: [],
    };
    setCurrentWorkout(newWorkout);
  };

  const endWorkout = (notes?: string) => {
    if (!currentWorkout) return;

    const completedWorkout: WorkoutSession = {
      ...currentWorkout,
      endTime: new Date().toISOString(),
      notes,
      duration: Math.round(
        (new Date().getTime() - new Date(currentWorkout.startTime).getTime()) / 60000
      ),
    };

    setWorkoutHistory((prev) => [completedWorkout, ...prev]);
    setCurrentWorkout(null);
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date);
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

    const lastWorkoutDate = sortedWorkouts.length > 0 ? sortedWorkouts[0].date : null;

    return {
      totalWorkouts,
      totalExercises,
      currentStreak,
      lastWorkoutDate,
    };
  };

  return (
    <WorkoutContext.Provider
      value={{
        workoutHistory,
        currentWorkout,
        startWorkout,
        endWorkout,
        addExerciseToWorkout,
        updateExerciseSet,
        toggleSetComplete,
        removeExerciseFromWorkout,
        getWorkoutStats,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within WorkoutProvider');
  }
  return context;
}
