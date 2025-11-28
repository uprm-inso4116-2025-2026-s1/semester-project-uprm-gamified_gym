import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useExercises,
  ExerciseCategory,
  ExercisePayload,
  ExerciseItem,
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

const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  Chest: "#FF6B6B",
  Back: "#4ECDC4",
  Legs: "#45B7D1",
  Biceps: "#F7B731",
  Triceps: "#5F27CD",
  Shoulders: "#00D2D3",
  Core: "#FF9FF3",
  Cardio: "#54A0FF",
};

export default function ExerciseManagement() {
  const navigation = useNavigation<NavProp>();
  const { savedExercises, addExercise, deleteExerciseAt } = useExercises();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>("Chest");
  const [filterCategory, setFilterCategory] = useState<ExerciseCategory | "All">("All");

  // Form state
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [duration, setDuration] = useState("");

  // Group exercises by category
  const groupedExercises = useMemo(() => {
    const groups: Record<ExerciseCategory, ExerciseItem[]> = {
      Chest: [],
      Back: [],
      Legs: [],
      Biceps: [],
      Triceps: [],
      Shoulders: [],
      Core: [],
      Cardio: [],
    };

    savedExercises.forEach((exercise) => {
      if (exercise.category && groups[exercise.category]) {
        groups[exercise.category].push(exercise);
      }
    });

    return groups;
  }, [savedExercises]);

  const handleAddExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    const newExercise: ExercisePayload = {
      name: exerciseName.trim(),
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      duration: duration.trim() || undefined,
      category: selectedCategory,
    };

    addExercise(newExercise);

    // Reset form
    setExerciseName("");
    setSets("3");
    setReps("10");
    setDuration("");
    setSelectedCategory("Chest");
    setModalVisible(false);

    Alert.alert("Success", `${exerciseName} added to ${selectedCategory}!`);
  };

  const handleDeleteExercise = (index: number, name: string) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteExerciseAt(index),
        },
      ]
    );
  };

  const filteredCategories =
    filterCategory === "All"
      ? CATEGORIES
      : CATEGORIES.filter((cat) => cat === filterCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <Text style={styles.headerSubtitle}>
          {savedExercises.length} exercises
        </Text>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterPill,
            filterCategory === "All" && styles.filterPillActive,
          ]}
          onPress={() => setFilterCategory("All")}
        >
          <Text
            style={[
              styles.filterPillText,
              filterCategory === "All" && styles.filterPillTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              filterCategory === cat && styles.filterPillActive,
              filterCategory === cat && {
                backgroundColor: CATEGORY_COLORS[cat],
              },
            ]}
            onPress={() => setFilterCategory(cat)}
          >
            <Text
              style={[
                styles.filterPillText,
                filterCategory === cat && styles.filterPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredCategories.map((category) => {
          const exercises = groupedExercises[category];
          if (exercises.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: CATEGORY_COLORS[category] },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>{category}</Text>
                </View>
                <Text style={styles.categoryCount}>{exercises.length}</Text>
              </View>

              {exercises.map((exercise, idx) => {
                const globalIndex = savedExercises.findIndex(
                  (ex) => ex.id === exercise.id
                );
                return (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseDetailText}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                        {exercise.duration && (
                          <Text style={styles.exerciseDetailText}>
                            • {exercise.duration}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteExercise(globalIndex, exercise.name)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}

        {savedExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No exercises yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first exercise
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Exercise Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image
            source={require("../../assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ExerciseLibrary")}>
          <Image
            source={require("../../assets/images/push-up.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={require("../../assets/images/user.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={require("../../assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Add Exercise Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Exercise</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Exercise Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Bench Press"
                value={exerciseName}
                onChangeText={setExerciseName}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                  style={styles.picker}
                >
                  {CATEGORIES.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Sets</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    value={sets}
                    onChangeText={setSets}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Duration (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30 seconds"
                value={duration}
                onChangeText={setDuration}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddExercise}
            >
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2E89FF",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: "#2E89FF",
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterPillTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 8,
  },
  exerciseDetailText: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2E89FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  modalForm: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#2E89FF",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#ffffff",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 35,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    paddingHorizontal: 30,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#000000",
  },
});
