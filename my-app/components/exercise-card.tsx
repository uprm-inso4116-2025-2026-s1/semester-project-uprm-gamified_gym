import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../lib/supabaseClient";

const muscleGroups = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core"];

const muscleGroupImages: Record<string, any> = {
  Chest: require("../assets/images/chestimage.png"),
  Back: require("../assets/images/backimage.png"),
  Legs: require("../assets/images/legimage.png"),
  Arms: require("../assets/images/armimage.png"),
  Shoulders: require("../assets/images/shoulderimage.png"),
  Core: require("../assets/images/coreimage.png"),
};

const SCREEN_WIDTH = Math.min(Dimensions.get("window").width, 600);

interface WorkoutSet {
  reps: string;
  weight: string;
}

interface Exercise {
  name: string;
  sets: WorkoutSet[];
  notes?: string;
  muscleGroup?: string;
}

const ExerciseCard = () => {
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [exerciseList, setExerciseList] = useState<Exercise[]>([
    { name: "Bench Press", sets: [{ reps: "", weight: "" }] },
  ]);

  const addExercise = () => {
    setExerciseList((prev) => [...prev, { name: "", sets: [{ reps: "", weight: "" }] }]);
  };

  const removeExercise = (index: number) => {
    setExerciseList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExerciseField = (index: number, field: keyof Exercise, value: string) => {
    const updated = [...exerciseList];
    (updated[index] as any)[field] = value;
    setExerciseList(updated);
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...exerciseList];
    updated[exerciseIndex].sets.push({ reps: "", weight: "" });
    setExerciseList(updated);
  };

  const updateSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string
  ) => {
    const updated = [...exerciseList];
    updated[exerciseIndex].sets[setIndex][field] = value.replaceAll(/[^0-9.]/g, "");
    setExerciseList(updated);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exerciseList];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setExerciseList(updated);
  };

  const saveWorkoutToDatabase = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "User not found.");
        return;
      }

      // Validation checks
      for (let exercise of exerciseList) {
        if (!exercise.name.trim()) {
          Alert.alert("Error", "Each exercise must have a name.");
          return;
        }
        for (let [i, set] of exercise.sets.entries()) {
          if (!set.reps || Number(set.reps) <= 0) {
            Alert.alert("Error", `${exercise.name} Set ${i + 1}: reps must be > 0`);
            return;
          }
          if (Number(set.weight) < 0) {
            Alert.alert("Error", `${exercise.name} Set ${i + 1}: weight must be ≥ 0`);
            return;
          }
        }
      }

      const formattedExercises = exerciseList.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({
          reps: Number(s.reps),
          weight: Number(s.weight),
        })),
        notes: ex.notes || "",
      }));

      const { error } = await supabase.from("workouts_test").insert({
        user_id: user.id,
        workout_name: workoutName,
        exercises: formattedExercises,
        date_completed: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Success", "Workout saved!");
      setWorkoutName("My Workout");
      setExerciseList([{ name: "Bench Press", sets: [{ reps: "", weight: "" }] }]);
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save workout");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {exerciseList.map((exercise, exIndex) => (
          <View key={exIndex} style={styles.exerciseCard}>
            <TouchableOpacity style={styles.deleteExerciseBtn} onPress={() => removeExercise(exIndex)}>
              <Text style={{ color: "white", fontWeight: "700" }}>x</Text>
            </TouchableOpacity>

            {exercise.muscleGroup && muscleGroupImages[exercise.muscleGroup] && (
              <Image
                source={muscleGroupImages[exercise.muscleGroup]}
                style={styles.muscleImage}
              />
            )}

            <View style={styles.muscleAndNameRow}>
              <Picker
                selectedValue={exercise.muscleGroup || ""}
                style={styles.musclePicker}
                onValueChange={(val) => updateExerciseField(exIndex, "muscleGroup", val)}
                mode="dropdown"
              >
                <Picker.Item label="Select Muscle Group" value="" />
                {muscleGroups.map((group, idx) => (
                  <Picker.Item key={idx} label={group} value={group} />
                ))}
              </Picker>

              <TextInput
                style={[styles.exerciseName, { flex: 1 }]}
                value={exercise.name}
                onChangeText={(val) => updateExerciseField(exIndex, "name", val)}
                placeholder="Exercise name"
              />
            </View>

            <TextInput
              style={styles.exerciseNotes}
              value={exercise.notes || ""}
              onChangeText={(val) => updateExerciseField(exIndex, "notes", val)}
              placeholder="Notes (optional)"
            />

            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  value={set.reps}
                  placeholder="Reps"
                  keyboardType="number-pad"
                  onChangeText={(val) => updateSetValue(exIndex, setIndex, "reps", val)}
                />
                <TextInput
                  style={styles.setInput}
                  value={set.weight}
                  placeholder="Weight"
                  keyboardType="decimal-pad"
                  onChangeText={(val) => updateSetValue(exIndex, setIndex, "weight", val)}
                />
                <TouchableOpacity
                  style={styles.deleteSetBtn}
                  onPress={() => removeSetFromExercise(exIndex, setIndex)}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>x</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSetToExercise(exIndex)}>
              <Text style={styles.addBtnText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise}>
          <Text style={styles.addBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={saveWorkoutToDatabase}>
          <Text style={styles.saveBtnText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    paddingTop: Platform.OS === "web" ? 24 : 0,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20,
    width: "95%",
  },
  exerciseCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  muscleImage: {
    width: SCREEN_WIDTH * 0.8,
    height: 150,
    resizeMode: "contain",
    marginBottom: 8,
  },
  muscleAndNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  musclePicker: { width: 150, height: 40 },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    color: "#333",
  },
  setRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  setLabel: { width: 60, fontWeight: "600", color: "#333" },
  setInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    paddingVertical: 6,
    textAlign: "center",
    fontWeight: "600",
  },
  addSetBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#2F80FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseBtn: {
    backgroundColor: "#2F80FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deleteSetBtn: {
    marginLeft: 8,
    backgroundColor: "#a43535ff",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteExerciseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#a43535ff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default ExerciseCard;