import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import ExerciseCard from "../../components/exercise-card"; 
import RecentWorkoutCard from "../../components/recent-workout-card";

export default function ExerciseLog() {
  const [showRecent, setShowRecent] = React.useState(false);


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises</Text>

    {/* Button to toggle recent workout */}
    <TouchableOpacity
      style={styles.button}
      onPress={()=> setShowRecent(!showRecent)}
      >
        <Text style = {styles.buttonText}>
          {showRecent ? "Hide Recent Workout" : "Show Recent Workout"}
        </Text>
      </TouchableOpacity>
      {showRecent && <RecentWorkoutCard />}

      <ExerciseCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    padding: 20,
  },

  header: {
    fontSize: 28,
    color: "white",
    marginBottom: 20,
},

   button: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: "#2E89FF",
    fontWeight: "600",
    fontSize: 16,
  },

});