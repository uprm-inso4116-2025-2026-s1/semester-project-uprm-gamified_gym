import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutsSupabase, WorkoutSession } from "./workoutStoreSupabase";

const CARD_BG = "#FFFFFF";
const LIGHT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

const WorkoutHistory: React.FC = () => {
  const { workoutHistory, loading, refreshWorkouts } = useWorkoutsSupabase();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    null
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWorkouts();
    setRefreshing(false);
  };

  const toggleExpand = (workoutId: string) => {
    setExpandedWorkoutId(expandedWorkoutId === workoutId ? null : workoutId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTotalSets = (workout: WorkoutSession) => {
    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );
  };

  const getCompletedSets = (workout: WorkoutSession) => {
    return workout.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.completed).length,
      0
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading workout history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
        <Text style={styles.headerSubtitle}>
          {workoutHistory.length} workout
          {workoutHistory.length !== 1 ? "s" : ""} completed
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2C82FF"
          />
        }
      >
        {workoutHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Workouts Yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your workouts to see your progress here!
            </Text>
          </View>
        ) : (
          workoutHistory.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const totalSets = getTotalSets(workout);
            const completedSets = getCompletedSets(workout);

            return (
              <View key={workout.id} style={styles.workoutCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(workout.id)}
                  style={styles.workoutHeader}
                >
                  <View style={styles.workoutHeaderLeft}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>
                        {formatDate(workout.date_completed)}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatTime(workout.date_completed)}
                      </Text>
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>
                        {workout.workout_name}
                      </Text>
                      <Text style={styles.workoutMeta}>
                        {workout.exercises.length} exercise
                        {workout.exercises.length !== 1 ? "s" : ""} ·{" "}
                        {completedSets}/{totalSets} sets
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.exercisesList}>
                    {workout.exercises.map((exercise, index) => (
                      <View
                        key={`${exercise.exerciseId}-${index}`}
                        style={styles.exerciseItem}
                      >
                        <View style={styles.exerciseHeader}>
                          <Text style={styles.exerciseName}>
                            {exercise.exerciseName}
                          </Text>
                          <Text style={styles.categoryBadge}>
                            {exercise.category}
                          </Text>
                        </View>
                        <View style={styles.setsContainer}>
                          {exercise.sets.map((set, setIndex) => (
                            <View key={setIndex} style={styles.setRow}>
                              <Text style={styles.setNumber}>
                                Set {setIndex + 1}
                              </Text>
                              <Text style={styles.setDetails}>
                                {set.reps} reps
                                {set.weight ? ` × ${set.weight} lbs` : ""}
                              </Text>
                              {set.completed && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={18}
                                  color="#4CAF50"
                                />
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutHistory;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginBottom: 12,
    ...LIGHT_SHADOW,
    overflow: "hidden",
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  workoutHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateContainer: {
    backgroundColor: "#2C82FF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  timeText: {
    fontSize: 11,
    color: "#FFF",
    opacity: 0.9,
    marginTop: 2,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 13,
    color: "#666",
  },
  exercisesList: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exerciseItem: {
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2C82FF",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  setsContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  setNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    width: 50,
  },
  setDetails: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
});
