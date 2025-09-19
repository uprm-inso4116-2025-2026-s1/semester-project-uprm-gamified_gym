import React from "react";
import { View, StyleSheet, Text } from "react-native";
import ExerciseCard from "../../components/exercise-card"; 

export default function ExerciseLog() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises</Text>
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

});