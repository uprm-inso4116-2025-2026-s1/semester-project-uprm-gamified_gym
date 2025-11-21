import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useExercises,
  ExerciseCategory,
  ExercisePayload,
} from "./exerciseStore";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ExerciseLog: undefined;
  ExerciseLibrary: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: ExerciseCategory[] = [
  "Chest",
  "Back",
  "Legs",
  "Biceps",
  "Triceps",
  "Shoulders",
  "Core",
  "Cardio",
];

const CATEGORY_COLORS: Record<ExerciseCategory, [string, string]> = {
  Chest: ["#FF6B6B", "#FF8E53"],
  Back: ["#4ECDC4", "#44A08D"],
  Legs: ["#45B7D1", "#96E6A1"],
  Biceps: ["#F7B731", "#FC4A1A"],
  Triceps: ["#5F27CD", "#9B59B6"],
  Shoulders: ["#00D2D3", "#667EEA"],
  Core: ["#FF9FF3", "#FDA7DF"],
  Cardio: ["#54A0FF", "#667EEA"],
};

const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  Chest: "fitness-outline",
  Back: "body-outline",
  Legs: "walk-outline",
  Biceps: "barbell-outline",
  Triceps: "hand-left-outline",
  Shoulders: "triangle-outline",
  Core: "ellipse-outline",
  Cardio: "heart-outline",
};

export default function CreateExercise() {
  const navigation = useNavigation<NavProp>();
  const { addExercise } = useExercises();
  const insets = useSafeAreaInsets();

  const [exerciseName, setExerciseName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ExerciseCategory>("Chest");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [duration, setDuration] = useState("");

  const handleCreateExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert("Missing Information", "Please enter an exercise name");
      return;
    }

    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);

    if (isNaN(setsNum) || setsNum <= 0) {
      Alert.alert("Invalid Sets", "Please enter a valid number of sets");
      return;
    }

    if (isNaN(repsNum) || repsNum <= 0) {
      Alert.alert("Invalid Reps", "Please enter a valid number of reps");
      return;
    }

    const newExercise: ExercisePayload = {
      name: exerciseName.trim(),
      sets: setsNum,
      reps: repsNum,
      duration: duration.trim() || undefined,
      category: selectedCategory,
    };

    addExercise(newExercise);

    Alert.alert(
      "Success!",
      `${exerciseName} has been added to ${selectedCategory}`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Exercise</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="fitness"
              size={20}
              color="#2E89FF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., Bench Press"
              placeholderTextColor="#999"
              value={exerciseName}
              onChangeText={setExerciseName}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Group</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryCard,
                  selectedCategory === category && {
                    backgroundColor: CATEGORY_COLORS[category][0],
                    borderColor: CATEGORY_COLORS[category][0],
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={CATEGORY_ICONS[category] as any}
                  size={28}
                  color={
                    selectedCategory === category ? "#fff" : CATEGORY_COLORS[category][0]
                  }
                />
                <Text
                  style={[
                    styles.categoryCardText,
                    selectedCategory === category && {
                      color: "#fff",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sets & Reps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sets & Reps</Text>
          <View style={styles.row}>
            <View style={styles.halfContainer}>
              <Text style={styles.label}>Sets</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => {
                    const current = parseInt(sets) || 0;
                    if (current > 1) setSets(String(current - 1));
                  }}
                >
                  <Ionicons name="remove" size={20} color="#2E89FF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => {
                    const current = parseInt(sets) || 0;
                    setSets(String(current + 1));
                  }}
                >
                  <Ionicons name="add" size={20} color="#2E89FF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfContainer}>
              <Text style={styles.label}>Reps</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => {
                    const current = parseInt(reps) || 0;
                    if (current > 1) setReps(String(current - 1));
                  }}
                >
                  <Ionicons name="remove" size={20} color="#2E89FF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => {
                    const current = parseInt(reps) || 0;
                    setReps(String(current + 1));
                  }}
                >
                  <Ionicons name="add" size={20} color="#2E89FF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Duration (Optional) */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <Text style={styles.optionalBadge}>Optional</Text>
          </View>
          <View style={styles.inputContainer}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#2E89FF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., 30 seconds, 2 minutes"
              placeholderTextColor="#999"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {/* Preview Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <LinearGradient
              colors={CATEGORY_COLORS[selectedCategory]}
              style={styles.previewStripe}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewName}>
                  {exerciseName || "Exercise Name"}
                </Text>
                <LinearGradient
                  colors={CATEGORY_COLORS[selectedCategory]}
                  style={styles.previewBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.previewBadgeText}>
                    {selectedCategory}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.previewMeta}>
                <View style={styles.previewMetaItem}>
                  <Ionicons name="layers-outline" size={16} color="#666" />
                  <Text style={styles.previewMetaText}>{sets} sets</Text>
                </View>
                <View style={styles.previewMetaItem}>
                  <Ionicons name="refresh-outline" size={16} color="#666" />
                  <Text style={styles.previewMetaText}>{reps} reps</Text>
                </View>
                {duration && (
                  <View style={styles.previewMetaItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.previewMetaText}>{duration}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateExercise}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create Exercise</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2E89FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#2E89FF",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    aspectRatio: 1.5,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  counterButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  counterInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    paddingVertical: 12,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewStripe: {
    width: "100%",
    height: 6,
  },
  previewContent: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  previewName: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  previewMeta: {
    flexDirection: "row",
    gap: 20,
  },
  previewMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewMetaText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E89FF",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#2E89FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
