import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * RecentWorkoutSummary
 * Displays the user's most recently completed workout summary.
 * Clearly names props and state for intention-revealing readability.
 */

interface WorkoutSummary {
  exerciseName: string;
  sets: number;
  reps: number;
  dateCompleted: string;
}

export default function RecentWorkoutSummary() {
  const [latestWorkout, setLatestWorkout] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    async function fetchRecentWorkout() {
      try {
        const savedWorkout = await AsyncStorage.getItem("mostRecentWorkout");
        if (savedWorkout) {
          setLatestWorkout(JSON.parse(savedWorkout));
        } else {
          setLatestWorkout({
            exerciseName: "Sample Workout",
            sets: 3,
            reps: 12,
            dateCompleted: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn("Failed to load recent workout:", error);
      }
    }

    fetchRecentWorkout();
  }, []);

  if (!latestWorkout) return null;

  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>Most Recent Workout</Text>

      <WorkoutDetail label="Exercise" value={latestWorkout.exerciseName} />
      <WorkoutDetail label="Sets" value={String(latestWorkout.sets)} />
      <WorkoutDetail label="Reps" value={String(latestWorkout.reps)} />
      <WorkoutDetail
        label="Date"
        value={new Date(latestWorkout.dateCompleted).toLocaleDateString()}
      />
    </TouchableOpacity>
  );
}

function WorkoutDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

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