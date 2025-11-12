import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Displays the user's most recently logged workout.
 * Shows summary details including exercise name, sets, reps, and completion date.
 */
type WorkoutSummary = {
  exerciseName: string;
  sets: number;
  reps: number;
  dateCompleted: string;
};

const RecentWorkoutCard = () => {
  const [recentWorkout, setRecentWorkout] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    const fetchRecentWorkout = async () => {
      try {
        const storedWorkout = await AsyncStorage.getItem("mostRecentWorkout");
        if (storedWorkout) {
          const parsedWorkout: WorkoutSummary = JSON.parse(storedWorkout);
          setRecentWorkout(parsedWorkout);
        } else {
          // fallback placeholder
          setRecentWorkout({
            exerciseName: "Sample Workout",
            sets: 3,
            reps: 12,
            dateCompleted: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn("Failed to load mostRecentWorkout", error);
      }
    };

    fetchRecentWorkout();
  }, []);

  if (!recentWorkout) return null;

  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>Most Recent Workout</Text>

      <WorkoutDetail label="Exercise" value={recentWorkout.exerciseName} />
      <WorkoutDetail label="Sets" value={String(recentWorkout.sets)} />
      <WorkoutDetail label="Reps" value={String(recentWorkout.reps)} />
      <WorkoutDetail
        label="Date"
        value={new Date(recentWorkout.dateCompleted).toLocaleDateString()}
      />
    </TouchableOpacity>
  );
};

/** Extracted for clarity: reveals that this is for rendering a labeled detail row */
const WorkoutDetail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#222",
  },
});

export default RecentWorkoutCard;