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
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useExercises,
  ExerciseCategory,
  ExerciseItem,
  ExercisePayload,
} from "./exerciseStore";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ExerciseLog: undefined;
  ExerciseLibrary: undefined;
  ExerciseDetail: { exercise: ExerciseItem; index: number };
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

export default function ExerciseDetail() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { updateExerciseAt, deleteExerciseAt } = useExercises();
  const insets = useSafeAreaInsets();

  const { exercise, index } = route.params as {
    exercise: ExerciseItem;
    index: number;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [exerciseName, setExerciseName] = useState(exercise.name);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>(
    exercise.category
  );
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(String(exercise.reps));
  const [duration, setDuration] = useState(exercise.duration || "");

  const handleSave = () => {
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

    const updates: Partial<ExercisePayload> = {
      name: exerciseName.trim(),
      sets: setsNum,
      reps: repsNum,
      duration: duration.trim() || undefined,
      category: selectedCategory,
    };

    updateExerciseAt(index, updates);
    setIsEditing(false);
    Alert.alert("Success", "Exercise updated successfully!");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteExerciseAt(index);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setExerciseName(exercise.name);
    setSelectedCategory(exercise.category);
    setSets(String(exercise.sets));
    setReps(String(exercise.reps));
    setDuration(exercise.duration || "");
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <LinearGradient
        colors={CATEGORY_COLORS[selectedCategory]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Details</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={CATEGORY_COLORS[selectedCategory]}
            style={styles.heroIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={CATEGORY_ICONS[selectedCategory] as any}
              size={48}
              color="#fff"
            />
          </LinearGradient>
          {isEditing ? (
            <TextInput
              style={styles.heroNameInput}
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Exercise name"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.heroName}>{exerciseName}</Text>
          )}
          <LinearGradient
            colors={CATEGORY_COLORS[selectedCategory]}
            style={styles.heroBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.heroBadgeText}>{selectedCategory}</Text>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="layers" size={24} color="#2E89FF" />
            <Text style={styles.statValue}>{sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="refresh" size={24} color="#2E89FF" />
            <Text style={styles.statValue}>{reps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          {duration && (
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#2E89FF" />
              <Text style={styles.statValue}>{duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          )}
        </View>

        {isEditing && (
          <>
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
                      size={24}
                      color={
                        selectedCategory === category
                          ? "#fff"
                          : CATEGORY_COLORS[category][0]
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

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration (Optional)</Text>
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
          </>
        )}

        {/* Info Section */}
        {!isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color="#666" />
                <Text style={styles.infoText}>
                  This exercise targets your {selectedCategory.toLowerCase()}{" "}
                  muscles.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="barbell" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Recommended: {sets} sets of {reps} repetitions
                </Text>
              </View>
              {duration && (
                <View style={styles.infoRow}>
                  <Ionicons name="timer" size={20} color="#666" />
                  <Text style={styles.infoText}>Duration: {duration}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete Exercise</Text>
          </TouchableOpacity>
        )}
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
  editButton: {
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
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  heroNameInput: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#2E89FF",
    paddingVertical: 8,
  },
  heroBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    aspectRatio: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  categoryCardText: {
    fontSize: 13,
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  counterButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  counterInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E89FF",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#2E89FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
