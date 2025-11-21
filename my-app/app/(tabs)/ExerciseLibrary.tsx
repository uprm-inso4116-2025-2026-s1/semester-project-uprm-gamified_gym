import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useExercises, ExerciseCategory, ExerciseItem } from "./exerciseStore";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ExerciseLog: undefined;
  ExerciseLibrary: undefined;
  CreateExercise: undefined;
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

export default function ExerciseLibrary() {
  const navigation = useNavigation<NavProp>();
  const { savedExercises } = useExercises();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "All"
  >("All");

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let filtered = savedExercises;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (exercise) => exercise.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [savedExercises, searchQuery, selectedCategory]);

  // Group exercises by category for "All" view
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

    filteredExercises.forEach((exercise) => {
      if (exercise.category && groups[exercise.category]) {
        groups[exercise.category].push(exercise);
      }
    });

    return groups;
  }, [filteredExercises]);

  const categoryStats = useMemo(() => {
    const stats: Record<ExerciseCategory, number> = {
      Chest: 0,
      Back: 0,
      Legs: 0,
      Biceps: 0,
      Triceps: 0,
      Shoulders: 0,
      Core: 0,
      Cardio: 0,
    };

    savedExercises.forEach((exercise) => {
      if (exercise.category && stats[exercise.category] !== undefined) {
        stats[exercise.category]++;
      }
    });

    return stats;
  }, [savedExercises]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#2E89FF", "#1E5FCC"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Exercise Library</Text>
            <Text style={styles.headerSubtitle}>
              {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateExercise")}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === "All" && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === "All" && styles.categoryChipTextActive,
            ]}
          >
            All ({savedExercises.length})
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && {
                backgroundColor: CATEGORY_COLORS[category][0],
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Ionicons
              name={CATEGORY_ICONS[category] as any}
              size={16}
              color={selectedCategory === category ? "#fff" : "#666"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category} ({categoryStats[category]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === "All" ? (
          // Show grouped by category
          CATEGORIES.map((category) => {
            const exercises = groupedExercises[category];
            if (exercises.length === 0) return null;

            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categorySectionHeader}>
                  <LinearGradient
                    colors={CATEGORY_COLORS[category]}
                    style={styles.categorySectionBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[category] as any}
                      size={18}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.categorySectionTitle}>{category}</Text>
                  <View style={styles.categorySectionCount}>
                    <Text style={styles.categorySectionCountText}>
                      {exercises.length}
                    </Text>
                  </View>
                </View>

                {exercises.map((exercise) => {
                  const globalIndex = savedExercises.findIndex(
                    (ex) => ex.id === exercise.id
                  );
                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseCard}
                      onPress={() =>
                        navigation.navigate("ExerciseDetail", {
                          exercise,
                          index: globalIndex,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={CATEGORY_COLORS[category]}
                        style={styles.exerciseCardStripe}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                      <View style={styles.exerciseCardContent}>
                        <View style={styles.exerciseCardLeft}>
                          <Text style={styles.exerciseCardName}>
                            {exercise.name}
                          </Text>
                          <View style={styles.exerciseCardMeta}>
                            <View style={styles.exerciseCardMetaItem}>
                              <Ionicons
                                name="layers-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.exerciseCardMetaText}>
                                {exercise.sets} sets
                              </Text>
                            </View>
                            <View style={styles.exerciseCardMetaItem}>
                              <Ionicons
                                name="refresh-outline"
                                size={14}
                                color="#666"
                              />
                              <Text style={styles.exerciseCardMetaText}>
                                {exercise.reps} reps
                              </Text>
                            </View>
                            {exercise.duration && (
                              <View style={styles.exerciseCardMetaItem}>
                                <Ionicons
                                  name="time-outline"
                                  size={14}
                                  color="#666"
                                />
                                <Text style={styles.exerciseCardMetaText}>
                                  {exercise.duration}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#ccc"
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })
        ) : (
          // Show filtered list
          <View style={styles.categorySection}>
            {filteredExercises.map((exercise) => {
              const globalIndex = savedExercises.findIndex(
                (ex) => ex.id === exercise.id
              );
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseCard}
                  onPress={() =>
                    navigation.navigate("ExerciseDetail", {
                      exercise,
                      index: globalIndex,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={CATEGORY_COLORS[exercise.category]}
                    style={styles.exerciseCardStripe}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.exerciseCardContent}>
                    <View style={styles.exerciseCardLeft}>
                      <Text style={styles.exerciseCardName}>
                        {exercise.name}
                      </Text>
                      <View style={styles.exerciseCardMeta}>
                        <View style={styles.exerciseCardMetaItem}>
                          <Ionicons
                            name="layers-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.exerciseCardMetaText}>
                            {exercise.sets} sets
                          </Text>
                        </View>
                        <View style={styles.exerciseCardMetaItem}>
                          <Ionicons
                            name="refresh-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.exerciseCardMetaText}>
                            {exercise.reps} reps
                          </Text>
                        </View>
                        {exercise.duration && (
                          <View style={styles.exerciseCardMetaItem}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color="#666"
                            />
                            <Text style={styles.exerciseCardMetaText}>
                              {exercise.duration}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={80} color="#ddd" />
            <Text style={styles.emptyStateTitle}>No exercises found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try a different search term"
                : "Create your first exercise to get started"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate("CreateExercise")}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>
                  Create Exercise
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      </View>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoryScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    maxHeight: 40,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#2E89FF",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  categorySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  categorySectionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  categorySectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  categorySectionCount: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categorySectionCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseCardStripe: {
    width: "100%",
    height: 6,
  },
  exerciseCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  exerciseCardLeft: {
    flex: 1,
  },
  exerciseCardName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  exerciseCardMeta: {
    flexDirection: "row",
    gap: 16,
  },
  exerciseCardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exerciseCardMetaText: {
    fontSize: 13,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#999",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E89FF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
