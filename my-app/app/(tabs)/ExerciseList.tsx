import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Reuse the same exercise data as AddWorkouts
const EXERCISES = [
  // Chest
  { name: "Bench Press", group: "Chest", type: "Strength" },
  { name: "Push Ups", group: "Chest", type: "Bodyweight" },
  { name: "Incline Dumbbell Press", group: "Chest", type: "Strength" },
  { name: "Chest Fly", group: "Chest", type: "Strength" },

  // Back
  { name: "Pull Ups", group: "Back", type: "Bodyweight" },
  { name: "Deadlift", group: "Back", type: "Strength" },
  { name: "Bent Over Row", group: "Back", type: "Strength" },
  { name: "Lat Pulldown", group: "Back", type: "Strength" },

  // Legs
  { name: "Squats", group: "Legs", type: "Strength" },
  { name: "Lunges", group: "Legs", type: "Bodyweight" },
  { name: "Leg Press", group: "Legs", type: "Strength" },
  { name: "Leg Extension", group: "Legs", type: "Strength" },

  // Shoulders
  { name: "Overhead Press", group: "Shoulders", type: "Strength" },
  { name: "Lateral Raise", group: "Shoulders", type: "Strength" },
  { name: "Front Raise", group: "Shoulders", type: "Strength" },
  { name: "Reverse Fly", group: "Shoulders", type: "Strength" },

  // Arms
  { name: "Bicep Curl", group: "Arms", type: "Strength" },
  { name: "Tricep Dip", group: "Arms", type: "Bodyweight" },
  { name: "Hammer Curl", group: "Arms", type: "Strength" },
  { name: "Tricep Pushdown", group: "Arms", type: "Strength" },

  // Cardio
  { name: "Running", group: "Cardio", type: "Cardio" },
  { name: "Cycling", group: "Cardio", type: "Cardio" },
  { name: "Jump Rope", group: "Cardio", type: "Cardio" },
  { name: "Rowing Machine", group: "Cardio", type: "Cardio" },
];

const FILTER_OPTIONS = ["All", "Strength", "Bodyweight", "Cardio"];

export default function ExerciseList() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Filter and group exercises
  const filteredExercises = EXERCISES.filter(
    (ex) =>
      (selectedFilter === "All" || ex.type === selectedFilter) &&
      ex.name.toLowerCase().includes(search.toLowerCase())
  );
  const groupedExercises: { [group: string]: any[] } = {};
  filteredExercises.forEach((ex) => {
    if (!groupedExercises[ex.group]) groupedExercises[ex.group] = [];
    groupedExercises[ex.group].push(ex);
  });

  const handleToggle = (exercise: any) => {
    setSelected((prev) =>
      prev.includes(exercise.name)
        ? prev.filter((n) => n !== exercise.name)
        : [...prev, exercise.name]
    );
  };

  const handleAddToWorkout = () => {
    router.push({
      pathname: "/(tabs)/AddWorkouts",
      params: { add: JSON.stringify(selected) },
    });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Exercise List</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* End Search Bar */}

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterBtn,
              selectedFilter === option && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedFilter(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === option && styles.filterTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* End Filter Buttons */}

      {Object.entries(groupedExercises).map(([group, exercises]) => (
        <View key={group} style={styles.exerciseGroupSection}>
          <Text style={styles.groupTitle}>{group}</Text>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.name}
              style={[
                styles.exerciseCard,
                selected.includes(exercise.name) && styles.selectedCard,
              ]}
              onPress={() => handleToggle(exercise)}
              activeOpacity={0.8}
            >
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Ionicons
                name={
                  selected.includes(exercise.name)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={22}
                color={selected.includes(exercise.name) ? "#2C82FF" : "#888"}
              />
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity
        style={[
          styles.addBtn,
          selected.length === 0 && { backgroundColor: "#BFD8FF" },
        ]}
        onPress={handleAddToWorkout}
        disabled={selected.length === 0}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.addBtnText}>Add to Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    color: "#2C82FF",
    marginBottom: 24,
    fontWeight: "bold",
    alignSelf: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    gap: 8,
  },
  filterBtn: {
    backgroundColor: "#EEE",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 2,
  },
  filterBtnActive: {
    backgroundColor: "#2C82FF",
  },
  filterText: {
    color: "#555",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  exerciseGroupSection: {
    marginBottom: 28,
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  groupTitle: {
    fontSize: 17,
    color: "#2C82FF",
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  exerciseCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6ECF5",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedCard: {
    borderColor: "#2C82FF",
    backgroundColor: "#E6F0FF",
  },
  exerciseName: { fontWeight: "600", color: "#1F1F1F", fontSize: 15, flex: 1 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C82FF",
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 32,
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});