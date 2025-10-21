import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** 
* Summary Card that shows the most recent workout completed or 
* logged by the user
*
* The fields the card should show are Exercise Name,Sets,Reps and Date completed
*
*/

type Workout = {
  exerciseName: string;
  sets: number;
  reps: number;
  dateCompleted: string;
};

const RecentWorkoutCard = () => {
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const stored = await AsyncStorage.getItem("mostRecentWorkout");
        if (stored) {
          const parsed: Workout = JSON.parse(stored);
          setWorkout(parsed);
        } else {
          // fallback placeholder
          setWorkout({
            exerciseName: "Sample Workout",
            sets: 3,
            reps: 12,
            dateCompleted: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Failed to load mostRecentWorkout", e);
      }
    };

    loadWorkout();
  }, []);

  if (!workout) return null;

  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>Most Recent Workout</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Exercise:</Text>
        <Text style={styles.value}>{workout.exerciseName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Sets:</Text>
        <Text style={styles.value}>{workout.sets}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Reps:</Text>
        <Text style={styles.value}>{workout.reps}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {new Date(workout.dateCompleted).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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