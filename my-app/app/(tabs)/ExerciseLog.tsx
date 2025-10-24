// this is old ExerciseLog.tsx file before integrating supabase saved workouts

import React from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert,
    TextInput,
    Button,
    ScrollView,
    Platform,
    ToastAndroid,
} from "react-native";
import ExerciseCard from "../../components/exercise-card"; 
import RecentWorkoutCard from "../../components/recent-workout-card";

export default function ExerciseLog() {
  const [showRecent, setShowRecent] = React.useState(false);
  const [savedWorkouts, setSavedWorkouts] = React.useState([
    { id: "1", title: "Upper Body", date: "2025-10-12", details: "Bench 3x8, Row 3x10, OHP 3x8" },
    { id: "2", title: "Leg Day Strength", date: "2025-10-15", details: "Squat 5x5, Deadlift 3x5, Lunges 3x10" },
    { id: "3", title: "Full Body Circuit", date: "2025-10-20", details: "Circuit: KB swings, Pushups, Pullups x4" },
  ]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedWorkout, setSelectedWorkout] = React.useState(null as null | { id: string; title: string; date: string; details: string });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState("");

  function openWorkout(w) {
    setSelectedWorkout(w);
    setEditingTitle(w.title);
    setIsEditing(false);
    setModalVisible(true);
  }

  function handleDelete(id: string) {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this saved workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setSavedWorkouts(prev => prev.filter(w => w.id !== id));
            setModalVisible(false);
            setSelectedWorkout(null);
          },
        },
      ]
    );
  }

  function saveEdit() {
    if (!selectedWorkout) return;
    setSavedWorkouts(prev =>
      prev.map(w => (w.id === selectedWorkout.id ? { ...w, title: editingTitle } : w))
    );
    setSelectedWorkout(prev => (prev ? { ...prev, title: editingTitle } : prev));
    setIsEditing(false);

    // Show confirmation toast / alert
    if (Platform.OS === "android") {
      ToastAndroid.show("Workout Saved Successfully.", ToastAndroid.SHORT);
    } else {
      Alert.alert("Success", "Workout Saved Successfully.");
    }
  }

  // Add handler to show confirmation when a workout is saved/done
  function handleWorkoutSaved(customMessage?: string) {
    const msg = customMessage ?? "Workout Saved Successfully.";
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("Success", msg);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises</Text>

    {/* Button to toggle recent workout */}
    <TouchableOpacity
      style={styles.button}
      onPress={()=> setShowRecent(!showRecent)}
      >
        <Text style = {styles.buttonText}>
          {showRecent ? "Hide Recent Workout" : "Show Recent Workout"}
        </Text>
      </TouchableOpacity>
      {showRecent && <RecentWorkoutCard />}

      {/* Saved Workouts History Section */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Saved Workouts</Text>

        <FlatList
          data={savedWorkouts}
          keyExtractor={(item) => item.id}
          style={{ width: "100%" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => openWorkout(item)}
            >
              <View>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <Text style={styles.workoutDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No saved workouts yet.</Text>}
        />
      </View>

      {/* Pass handler to ExerciseCard so it can notify when "Done" is tapped */}
      <ExerciseCard onDone={handleWorkoutSaved} />

      {/* Modal: view / edit / delete */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedWorkout && (
                <>
                  {isEditing ? (
                    <>
                      <Text style={styles.modalLabel}>Edit Title</Text>
                      <TextInput
                        value={editingTitle}
                        onChangeText={setEditingTitle}
                        style={styles.input}
                      />
                      <View style={styles.modalActions}>
                        <Button title="Save" onPress={saveEdit} />
                        <Button title="Cancel" color="#888" onPress={() => { setIsEditing(false); setEditingTitle(selectedWorkout.title); }} />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                      <Text style={styles.modalDate}>{selectedWorkout.date}</Text>
                      <Text style={styles.modalDetailsLabel}>Details</Text>
                      <Text style={styles.modalDetails}>{selectedWorkout.details}</Text>

                      <View style={styles.modalActions}>
                        <Button title="Edit" onPress={() => setIsEditing(true)} />
                        <Button title="Delete" color="#d9534f" onPress={() => handleDelete(selectedWorkout.id)} />
                      </View>
                    </>
                  )}
                </>
              )}

              <View style={{ marginTop: 12 }}>
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    padding: 20,
  },

  header: {
    fontSize: 28,
    color: "white",
    marginBottom: 20,
  },

   button: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: "#2E89FF",
    fontWeight: "600",
    fontSize: 16,
  },

  // New styles for history and modal
  historyContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "600",
  },
  historyItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutTitle: {
    color: "#2E89FF",
    fontWeight: "700",
    fontSize: 16,
  },
  workoutDate: {
    color: "#444",
    fontSize: 12,
  },
  emptyText: {
    color: "white",
    textAlign: "center",
    padding: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalDate: {
    color: "#666",
    marginBottom: 12,
  },
  modalDetailsLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  modalDetails: {
    color: "#333",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  modalLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
});