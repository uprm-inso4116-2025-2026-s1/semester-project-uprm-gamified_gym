import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useWorkoutsSupabase } from './workoutStoreSupabase';

export type AchievementCategory = "Strength" | "Consistency" | "Progress" | "Milestones";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  progress: number;
  target: number;
  locked: boolean;
  icon: string;
  reward: string;
};

type AchievementContextType = {
  achievements: Achievement[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    locked: number;
  };
};

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProviderSupabase({ children }: { children: ReactNode }) {
  const { workoutHistory, getWorkoutStats } = useWorkoutsSupabase();
  const workoutStats = getWorkoutStats();

  const achievements = useMemo<Achievement[]>(() => {
    const { totalWorkouts, totalExercises, currentStreak } = workoutStats;

    // Calculate total weight lifted
    const totalWeight = workoutHistory.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return setSum + (set.weight || 0) * set.reps;
        }, 0);
      }, 0);
    }, 0);

    // Check if worked out before 7 AM
    const hasEarlyMorningWorkout = workoutHistory.some(workout => {
      const hour = new Date(workout.date_completed).getHours();
      return hour < 7;
    });

    // Count "intense" workouts (workouts with 5+ exercises or 20+ total sets)
    const intenseWorkouts = workoutHistory.filter(workout => {
      const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      return workout.exercises.length >= 5 || totalSets >= 20;
    }).length;

    // Count unique exercises (by name)
    const uniqueExercises = new Set(
      workoutHistory.flatMap(workout =>
        workout.exercises.map(ex => ex.exerciseName)
      )
    ).size;

    return [
      // Easy Beginner Achievements
      {
        id: "1",
        title: "First Steps",
        description: "Complete your first workout",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 1),
        target: 1,
        locked: totalWorkouts === 0,
        icon: "footsteps",
        reward: "50 XP",
      },
      {
        id: "9",
        title: "Getting Started",
        description: "Complete 3 workouts",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 3),
        target: 3,
        locked: totalWorkouts === 0,
        icon: "fitness",
        reward: "75 XP",
      },
      {
        id: "10",
        title: "Building Momentum",
        description: "Complete 5 workouts",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 5),
        target: 5,
        locked: totalWorkouts === 0,
        icon: "rocket",
        reward: "100 XP",
      },
      {
        id: "11",
        title: "Perfect Pair",
        description: "Work out 2 days in a row",
        category: "Consistency",
        progress: Math.min(currentStreak, 2),
        target: 2,
        locked: currentStreak === 0,
        icon: "heart",
        reward: "50 XP",
      },
      {
        id: "12",
        title: "Variety Seeker",
        description: "Try 3 different exercises",
        category: "Progress",
        progress: Math.min(uniqueExercises, 3),
        target: 3,
        locked: uniqueExercises === 0,
        icon: "apps",
        reward: "60 XP",
      },
      {
        id: "13",
        title: "Exercise Sampler",
        description: "Try 5 different exercises",
        category: "Progress",
        progress: Math.min(uniqueExercises, 5),
        target: 5,
        locked: uniqueExercises === 0,
        icon: "grid",
        reward: "80 XP",
      },
      {
        id: "14",
        title: "Full Session",
        description: "Complete a workout with 3+ exercises",
        category: "Milestones",
        progress: workoutHistory.some(w => w.exercises.length >= 3) ? 1 : 0,
        target: 1,
        locked: workoutHistory.every(w => w.exercises.length < 3),
        icon: "checkmark-done",
        reward: "70 XP",
      },
      {
        id: "15",
        title: "Dedicated Ten",
        description: "Complete 10 workouts",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 10),
        target: 10,
        locked: totalWorkouts === 0,
        icon: "medal",
        reward: "125 XP",
      },

      // Medium Difficulty Achievements
      {
        id: "2",
        title: "Week Warrior",
        description: "Work out 7 days in a row",
        category: "Consistency",
        progress: Math.min(currentStreak, 7),
        target: 7,
        locked: currentStreak === 0,
        icon: "flame",
        reward: "200 XP",
      },
      {
        id: "16",
        title: "Twenty Strong",
        description: "Complete 20 workouts",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 20),
        target: 20,
        locked: totalWorkouts === 0,
        icon: "star",
        reward: "200 XP",
      },
      {
        id: "5",
        title: "Early Bird",
        description: "Work out before 7 AM",
        category: "Milestones",
        progress: hasEarlyMorningWorkout ? 1 : 0,
        target: 1,
        locked: !hasEarlyMorningWorkout,
        icon: "sunny",
        reward: "75 XP",
      },
      {
        id: "17",
        title: "Exercise Library",
        description: "Try 10 different exercises",
        category: "Progress",
        progress: Math.min(uniqueExercises, 10),
        target: 10,
        locked: uniqueExercises === 0,
        icon: "book",
        reward: "100 XP",
      },

      // Hard Achievements
      {
        id: "3",
        title: "Iron Lifter",
        description: "Lift 1000 lbs total",
        category: "Strength",
        progress: Math.min(Math.floor(totalWeight), 1000),
        target: 1000,
        locked: totalWeight === 0,
        icon: "barbell",
        reward: "250 XP",
      },
      {
        id: "6",
        title: "Exercise Explorer",
        description: "Complete 50 different exercises",
        category: "Progress",
        progress: Math.min(uniqueExercises, 50),
        target: 50,
        locked: uniqueExercises === 0,
        icon: "ribbon",
        reward: "300 XP",
      },
      {
        id: "7",
        title: "Streak Master",
        description: "30-day workout streak",
        category: "Consistency",
        progress: Math.min(currentStreak, 30),
        target: 30,
        locked: currentStreak === 0,
        icon: "calendar",
        reward: "400 XP",
      },
      {
        id: "8",
        title: "Beast Mode",
        description: "Complete 10 intense workouts",
        category: "Strength",
        progress: Math.min(intenseWorkouts, 10),
        target: 10,
        locked: intenseWorkouts === 0,
        icon: "flash",
        reward: "300 XP",
      },
      {
        id: "4",
        title: "Century Club",
        description: "Complete 100 total workouts",
        category: "Milestones",
        progress: Math.min(totalWorkouts, 100),
        target: 100,
        locked: totalWorkouts === 0,
        icon: "trophy",
        reward: "500 XP",
      },
    ];
  }, [workoutHistory, workoutStats]);

  const stats = useMemo(() => {
    const completed = achievements.filter((a) => a.progress >= a.target).length;
    const inProgress = achievements.filter(
      (a) => a.progress > 0 && a.progress < a.target
    ).length;
    const locked = achievements.filter((a) => a.locked).length;

    return {
      total: achievements.length,
      completed,
      inProgress,
      locked,
    };
  }, [achievements]);

  return (
    <AchievementContext.Provider value={{ achievements, stats }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievementsSupabase() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievementsSupabase must be used within AchievementProviderSupabase');
  }
  return context;
}
