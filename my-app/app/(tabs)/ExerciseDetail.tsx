import React, { useState, useEffect, useRef } from "react";
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
  Modal,
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
import { useWorkoutsSupabase as useWorkouts } from "./workoutStoreSupabase";

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
  const { startWorkout, addExerciseToWorkout, endWorkout, currentWorkout } = useWorkouts();
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

  // Update state when route params change
  useEffect(() => {
    setExerciseName(exercise.name);
    setSelectedCategory(exercise.category);
    setSets(String(exercise.sets));
    setReps(String(exercise.reps));
    setDuration(exercise.duration || "");
    setIsEditing(false);
  }, [exercise.id, exercise.name, exercise.category, exercise.sets, exercise.reps, exercise.duration]);

  // Timer state for cardio exercises
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer effects
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleStartCardioTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setShowTimer(true);
  };

  const handleFinishCardio = () => {
    setIsTimerRunning(false);
    const duration = formatTime(timerSeconds);

    Alert.alert(
      "Log Cardio Exercise",
      `Log "${exercise.name}" with duration ${duration}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log",
          onPress: async () => {
            try {
              // Start a new workout, add exercise, and end it immediately
              startWorkout();

              await new Promise((resolve) => {
                setTimeout(() => {
                  addExerciseToWorkout(exercise);
                  resolve(null);
                }, 100);
              });

              await new Promise((resolve) => {
                setTimeout(async () => {
                  try {
                    await endWorkout(`Logged ${exercise.name} - ${duration}`);
                    resolve(null);
                  } catch (error: any) {
                    Alert.alert(
                      "Error",
                      error.message || "Failed to save workout. Please make sure you're logged in.",
                      [{ text: "OK" }]
                    );
                    resolve(null);
                  }
                }, 100);
              });

              setShowTimer(false);
              resetTimer();

              Alert.alert(
                "Success!",
                `${exercise.name} (${duration}) has been logged! Check your achievements to see your progress.`,
                [{ text: "OK" }]
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to log workout",
                [{ text: "OK" }]
              );
            }
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

  const handleLogWorkout = () => {
    Alert.alert(
      "Log Exercise",
      `Log "${exercise.name}" as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log",
          onPress: async () => {
            try {
              // Start a new workout, add exercise, and end it immediately
              startWorkout();

              // Use setTimeout to ensure state updates propagate
              await new Promise((resolve) => {
                setTimeout(() => {
                  addExerciseToWorkout(exercise);
                  resolve(null);
                }, 100);
              });

              await new Promise((resolve) => {
                setTimeout(async () => {
                  try {
                    await endWorkout(`Logged ${exercise.name}`);
                    resolve(null);
                  } catch (error: any) {
                    Alert.alert(
                      "Error",
                      error.message || "Failed to save workout. Please make sure you're logged in.",
                      [{ text: "OK" }]
                    );
                    resolve(null);
                  }
                }, 100);
              });

              Alert.alert(
                "Success!",
                `${exercise.name} has been logged! Check your achievements to see your progress.`,
                [{ text: "OK" }]
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to log workout",
                [{ text: "OK" }]
              );
            }
          },
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
          <View style={styles.editActions}>
            {selectedCategory === "Cardio" ? (
              <TouchableOpacity
                style={styles.timerButton}
                onPress={handleStartCardioTimer}
                activeOpacity={0.8}
              >
                <Ionicons name="timer" size={24} color="#fff" />
                <Text style={styles.timerButtonText}>Start Timer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.logButton}
                onPress={handleLogWorkout}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.logButtonText}>Log Workout</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={24} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cardio Timer Modal */}
      <Modal
        visible={showTimer}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!isTimerRunning) {
            setShowTimer(false);
            resetTimer();
          }
        }}
      >
        <SafeAreaView style={styles.timerModalContainer}>
          <LinearGradient
            colors={CATEGORY_COLORS[selectedCategory]}
            style={styles.timerModalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <View style={styles.timerModalHeader}>
              <TouchableOpacity
                style={styles.timerCloseButton}
                onPress={() => {
                  if (!isTimerRunning) {
                    setShowTimer(false);
                    resetTimer();
                  } else {
                    Alert.alert(
                      "Timer Running",
                      "Please pause the timer before closing",
                      [{ text: "OK" }]
                    );
                  }
                }}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.timerModalTitle}>{exerciseName}</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Timer Display */}
            <View style={styles.timerDisplayContainer}>
              <Ionicons name="timer" size={60} color="rgba(255,255,255,0.9)" />
              <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
              <Text style={styles.timerSubtext}>
                {isTimerRunning ? "Running..." : "Paused"}
              </Text>
            </View>

            {/* Timer Controls */}
            <View style={styles.timerControls}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  style={styles.timerControlButton}
                  onPress={startTimer}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={40} color="#fff" />
                  <Text style={styles.timerControlText}>Start</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.timerControlButton}
                  onPress={pauseTimer}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pause" size={40} color="#fff" />
                  <Text style={styles.timerControlText}>Pause</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.timerControlButton}
                onPress={resetTimer}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={40} color="#fff" />
                <Text style={styles.timerControlText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Finish Button */}
            <TouchableOpacity
              style={styles.finishCardioButton}
              onPress={handleFinishCardio}
              activeOpacity={0.8}
              disabled={timerSeconds === 0}
            >
              <Ionicons name="checkmark-circle" size={28} color="#fff" />
              <Text style={styles.finishCardioButtonText}>Finish & Log</Text>
            </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
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
  logButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  timerButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  timerModalContainer: {
    flex: 1,
    backgroundColor: "#54A0FF",
  },
  timerModalGradient: {
    flex: 1,
    padding: 20,
  },
  timerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 60,
  },
  timerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  timerModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  timerDisplayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: "800",
    color: "#fff",
    marginTop: 20,
    letterSpacing: 4,
  },
  timerSubtext: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginTop: 10,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginBottom: 40,
  },
  timerControlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "#fff",
  },
  timerControlText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginTop: 8,
  },
  finishCardioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  finishCardioButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#54A0FF",
  },
});
