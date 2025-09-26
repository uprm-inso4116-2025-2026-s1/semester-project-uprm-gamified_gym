import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const BLUE = "#2C82FF";
const RED = "#E14B4B";
const CARD_BG = "#FFFFFF";
const LIGHT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

const EXERCISES = [
  "Bench Press",
  "Incline Dumbbell Press",
  "Push-ups",
  "Lat Pulldown",
  "Barbell Row",
  "Squat",
  "Leg Press",
  "Deadlift",
  "Overhead Press",
  "Bicep Curl",
  "Triceps Pushdown",
];

export default function AddWorkoutScreen() {
  const [title, setTitle] = useState("");
  const [exCount, setExCount] = useState(0);
  const [setCount, setSetCount] = useState(0);

  // Modal state
  const [showTile, setShowTile] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [duration, setDuration] = useState(""); // "45s" or "1:00"

  const resetTile = () => {
    setSelectedExercise(null);
    setSets(3);
    setReps(12);
    setDuration("");
  };

  const onSaveExercise = () => {
    if (!selectedExercise) {
      alert("Please select an exercise");
      return;
    }
    setExCount((c) => c + 1);
    setSetCount((s) => s + sets);
    setShowTile(false);
    resetTile();
  };

  const onDeleteExercise = () => {
    setShowTile(false);
    resetTile();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              {exCount} exercises, {setCount} sets
            </Text>

            <Text style={styles.subTitle}>Add exercises</Text>

            <TouchableOpacity
              style={styles.addPill}
              activeOpacity={0.75}
              onPress={() => setShowTile(true)}
            >
              <View style={styles.plusIcon}>
                <Ionicons name="add" size={18} />
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

      {/* Exercise Tile Modal */}
      <Modal
        visible={showTile}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTile(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setShowTile(false)}
          />
          <View style={styles.tileCard}>
            {/* Close X */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowTile(false)}>
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>

            <Text style={styles.tileLabel}>Exercise</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={selectedExercise}
                onValueChange={(val) => setSelectedExercise(val)}
                dropdownIconColor="#333"
              >
                <Picker.Item label="Select an exercise..." value={null} />
                {EXERCISES.map((ex) => (
                  <Picker.Item key={ex} label={ex} value={ex} />
                ))}
              </Picker>
            </View>

            {/* Sets & Reps */}
            <View style={styles.row}>
              {/* Sets */}
              <View style={styles.counterCard}>
                <TouchableOpacity
                  onPress={() => setSets((v) => Math.max(0, v - 1))}
                  style={styles.counterBtn}
                >
                  <Ionicons name="remove" size={18} />
                </TouchableOpacity>

                <View style={styles.counterBubble}>
                  <Text style={styles.counterNumber}>{sets}</Text>
                  <Text style={styles.counterSub}>Sets</Text>
                </View>

                <TouchableOpacity onPress={() => setSets((v) => v + 1)} style={styles.counterBtn}>
                  <Ionicons name="add" size={18} />
                </TouchableOpacity>
              </View>

              {/* Reps */}
              <View style={styles.counterCard}>
                <TouchableOpacity
                  onPress={() => setReps((v) => Math.max(0, v - 1))}
                  style={styles.counterBtn}
                >
                  <Ionicons name="remove" size={18} />
                </TouchableOpacity>

                <View style={styles.counterBubble}>
                  <Text style={styles.counterNumber}>{reps}</Text>
                  <Text style={styles.counterSub}>Reps</Text>
                </View>

                <TouchableOpacity onPress={() => setReps((v) => v + 1)} style={styles.counterBtn}>
                  <Ionicons name="add" size={18} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration */}
            <Text style={[styles.tileLabel, { marginTop: 14 }]}>Duration:</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="optional (e.g., 45s)"
              placeholderTextColor="#6B6B6B"
              style={styles.tileInput}
            />

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: BLUE }]}
                onPress={onSaveExercise}
              >
                <Text style={styles.actionTextLight}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: RED }]}
                onPress={onDeleteExercise}
              >
                <Text style={styles.actionTextLight}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

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

  addPill: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  plusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addPillText: { fontWeight: "700", color: "#1F1F1F" },

  saveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 80,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 24,
    ...LIGHT_SHADOW,
  },
  saveText: { color: "#FFF", fontWeight: "600" },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  tileCard: {
    width: "88%",
    backgroundColor: "#F1F1F1",
    borderRadius: 16,
    padding: 14,
    ...LIGHT_SHADOW,
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 6,
    zIndex: 2,
  },
  tileLabel: {
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "600",
    color: "#222",
  },
  tileInput: {
    backgroundColor: "#DFDFDF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
  },
  pickerWrap: {
    backgroundColor: "#DFDFDF",
    borderRadius: 8,
    overflow: "hidden",
    height: Platform.OS === "ios" ? 48 : undefined,
    justifyContent: "center",
  },
  row: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  counterCard: {
    flex: 1,
    backgroundColor: "#EEEEEE",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBubble: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  counterNumber: { fontSize: 20, fontWeight: "700", color: "#222" },
  counterSub: { fontSize: 12, color: "#666", marginTop: 2 },

  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextLight: { color: "#FFF", fontWeight: "700" },
});
