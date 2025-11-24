import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useWorkouts } from './workoutStore';

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

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { workoutHistory, getWorkoutStats } = useWorkouts();
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
      const hour = new Date(workout.startTime).getHours();
      return hour < 7;
    });

    // Count "intense" workouts (workouts with 5+ exercises or 20+ total sets)
    const intenseWorkouts = workoutHistory.filter(workout => {
      const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      return workout.exercises.length >= 5 || totalSets >= 20;
    }).length;

    return [
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
        id: "2",
        title: "Week Warrior",
        description: "Work out 7 days in a row",
        category: "Consistency",
        progress: Math.min(currentStreak, 7),
        target: 7,
        locked: currentStreak === 0,
        icon: "flame",
        reward: "100 XP",
      },
      {
        id: "3",
        title: "Iron Lifter",
        description: "Lift 1000 lbs total",
        category: "Strength",
        progress: Math.min(Math.floor(totalWeight), 1000),
        target: 1000,
        locked: totalWeight === 0,
        icon: "barbell",
        reward: "200 XP",
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
        id: "6",
        title: "Exercise Explorer",
        description: "Complete 50 different exercises",
        category: "Progress",
        progress: Math.min(totalExercises, 50),
        target: 50,
        locked: totalExercises === 0,
        icon: "ribbon",
        reward: "150 XP",
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
        reward: "300 XP",
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
        reward: "250 XP",
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

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
}
