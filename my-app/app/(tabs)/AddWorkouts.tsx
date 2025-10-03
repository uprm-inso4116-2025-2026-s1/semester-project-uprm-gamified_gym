import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const BLUE = "#2C82FF";
const CARD_BG = "#FFFFFF";
const LIGHT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

// Expanded exercise data with Cardio group added
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

export default function AddWorkoutScreen() {
  const [title, setTitle] = useState("");
  const [addedExercises, setAddedExercises] = useState<any[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Sync exercises from ExerciseList
  React.useEffect(() => {
    if (params.add) {
      try {
        const names = JSON.parse(params.add as string) as string[];
        const newExercises = EXERCISES.filter(ex => names.includes(ex.name));
        setAddedExercises(prev =>
          [
            ...prev,
            ...newExercises.filter(
              ex => !prev.some(e => e.name === ex.name)
            ),
          ]
        );
        router.setParams({ add: undefined });
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [params.add]);

  const handleRemoveExercise = (exercise: any) => {
    setAddedExercises(addedExercises.filter((ex) => ex.name !== exercise.name));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.headerBar}>
              <Text style={styles.headerText}>Add Workout</Text>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a Title"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
            />

            <Text style={styles.counts}>
              {addedExercises.length} exercises
            </Text>

            <Text style={styles.subTitle}>Added exercises</Text>
            {addedExercises.length === 0 && (
              <Text style={{ marginHorizontal: 16, color: "#888", marginBottom: 8 }}>
                No exercises added yet.
              </Text>
            )}
            {addedExercises.map((ex, idx) => (
              <View key={ex.name} style={styles.addedExerciseRow}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <View style={styles.exerciseTags}>
                  <View style={styles.tag}><Text style={styles.tagText}>{ex.group}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>{ex.type}</Text></View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveExercise(ex)}>
                  <Ionicons name="close-circle" size={22} color="#FF5A5A" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add exercises button that navigates to Exercise List */}
            <TouchableOpacity
              style={styles.addPill}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/ExerciseList")}
            >
              <View style={styles.plusIcon}>
                <Ionicons name="add" size={18} color="#2C82FF" />
              </View>
              <Text style={styles.addPillText}>Add exercises</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
        <View style={styles.saveWrap}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={() => {}}>
            <Text style={styles.saveText}>Save Workout</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    ...LIGHT_SHADOW,
    paddingBottom: 16,
    overflow: "hidden",
  },
  headerBar: {
    backgroundColor: "#E6E6E6",
    paddingVertical: 10,
    alignItems: "center",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  headerText: { fontWeight: "600", color: "#1A1A1A" },

  input: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },

  counts: { marginTop: 10, marginHorizontal: 16, color: "#333" },
  subTitle: { marginTop: 16, marginHorizontal: 16, fontWeight: "700", color: "#222" },

  // Added exercises
  addedExerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 10,
  },
  exerciseName: { fontWeight: "600", color: "#1F1F1F", fontSize: 15, flex: 1 },
  exerciseTags: { flexDirection: "row", gap: 6 },
  tag: {
    backgroundColor: "#E6F0FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginRight: 6,
  },
  tagText: {
    color: "#2C82FF",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.2,
  },

  saveWrap: { position: "absolute", left: 0, right: 0, bottom: 80, alignItems: "center" },
  saveBtn: { backgroundColor: BLUE, paddingHorizontal: 26, paddingVertical: 12, borderRadius: 24, ...LIGHT_SHADOW },
  saveText: { color: "#FFF", fontWeight: "600" },

  // Styles for the add exercises pill
  addPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F0FF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  plusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D0E6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  addPillText: {
    color: "#2C82FF",
    fontWeight: "500",
    fontSize: 15,
  },
});