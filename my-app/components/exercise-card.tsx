import React from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, 
  Keyboard, Alert, Dimensions, Platform, Image 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabaseClient';

const predefinedExercises = [
  "Chest",
  "Back",
  "Legs",
  "Arms",
  "Shoulders",
  "Core",
];

const muscleGroupImages: Record<string, any> = {
  Chest: require("../assets/images/chestimage.png"),
  Back: require('../assets/images/backimage.png'),
  Legs: require('../assets/images/legimage.png'),
  Arms: require('../assets/images/armimage.png'),
  Shoulders: require('../assets/images/shoulderimage.png'),
  Core: require('../assets/images/coreimage.png'),
};

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 600);

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

const BLUE = "#2F80FF";
const GREEN = "#28a745";
const GRAY = "#888";

const ExerciseLogScreen = () => {
  const [workoutName, setWorkoutName] = React.useState<string>("My Workout");
  const [exercises, setExercises] = React.useState<Exercise[]>([
    { name: "Bench Press", sets: [{ reps: "", weight: "" }] },
  ]);

  const handleAddExercise = () => {
    setExercises(prev => [...prev, { name: "", sets: [{ reps: "", weight: "" }] }]);
  };

  const handleChangeExerciseName = (index: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = value;
    setExercises(newExercises);
  };

  const handleChangeExerciseNotes = (index: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[index].notes = value;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: "", weight: "" });
    setExercises(newExercises);
  };

  const handleChangeSet = (exerciseIndex: number, setIndex: number, field: "reps" | "weight", value: string) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value.replaceAll(/[^0-9.]/g, '');
    setExercises(newExercises);
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
  };

  const handleDeleteExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleSaveWorkout = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Error", "No logged-in user found.");
        return;
      }

      for (let ex of exercises) {
        if (!ex.name.trim()) {
          Alert.alert("Error", "All exercises must have a name");
          return;
        }
        for (let i = 0; i < ex.sets.length; i++) {
          const { reps, weight } = ex.sets[i];
          if (!reps || Number.isNaN(Number(reps)) || Number(reps) <= 0) {
            Alert.alert("Error", `${ex.name} Set ${i + 1} reps must be a number > 0`);
            return;
          }
          if (!weight || Number.isNaN(Number(weight)) || Number(weight) < 0) {
            Alert.alert("Error", `${ex.name} Set ${i + 1} weight must be >= 0`);
            return;
          }
        }
      }

      const exercisesJSON = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: Number(s.reps), weight: Number(s.weight) })),
        notes: ex.notes || ""
      }));

      const { error } = await supabase.from("workouts_test").insert({
        user_id: user.id,
        workout_name: workoutName,
        exercises: exercisesJSON,
        date_completed: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Success", "Workout saved!");
      setWorkoutName("My Workout");
      setExercises([{ name: "Bench Press", sets: [{ reps: "", weight: "" }] }]);
      Keyboard.dismiss();

    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save workout");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {exercises.map((exercise, exIndex) => (
            <View key={exIndex} style={styles.exerciseCard}>
              <TouchableOpacity 
                style={styles.deleteExerciseBtn} 
                onPress={() => handleDeleteExercise(exIndex)}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>x</Text>
              </TouchableOpacity>

              {/* Muscle group image */}
              {exercise.muscleGroup && muscleGroupImages[exercise.muscleGroup] && (
                <Image
                  source={muscleGroupImages[exercise.muscleGroup]}
                  style={{ width: SCREEN_WIDTH * 0.8, height: 150, resizeMode: 'contain', marginBottom: 8 }}
                />
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: BLUE,
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    marginRight: 8,
                    overflow: 'hidden',
                    marginTop: -8
                  }}
                >
                  <Picker
                    selectedValue={exercise.muscleGroup || ""}
                    style={{ width: 150, height: 40 }}
                    onValueChange={(itemValue) => {
                      setExercises(prevExercises => {
                        const updated = [...prevExercises];
                        if (updated[exIndex]) {
                          updated[exIndex].muscleGroup = String(itemValue);
                        }
                        return updated;
                      });
                    }}
                    mode="dropdown"
                  >
                    <Picker.Item label="Select Muscle Group" value="" />
                    {predefinedExercises.map((ex, idx) => (
                      <Picker.Item key={idx} label={ex} value={ex} />
                    ))}
                  </Picker>
                </View>

                <TextInput
                  style={[styles.exerciseName, { flex: 1 }]}
                  value={exercise.name}
                  onChangeText={(val) => handleChangeExerciseName(exIndex, val)}
                  placeholder="Exercise name"
                  placeholderTextColor={GRAY}
                />
              </View>
              
              <TextInput
                style={styles.exerciseNotes}
                value={exercise.notes || ""}
                onChangeText={(val) => handleChangeExerciseNotes(exIndex, val)}
                placeholder="Notes (optional)"
                placeholderTextColor={GRAY}
              />

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    value={set.reps}
                    placeholder="Reps"
                    keyboardType="number-pad"
                    onChangeText={(val) => handleChangeSet(exIndex, setIndex, "reps", val)}
                  />
                  <TextInput
                    style={styles.setInput}
                    value={set.weight}
                    placeholder="Weight"
                    keyboardType="decimal-pad"
                    onChangeText={(val) => handleChangeSet(exIndex, setIndex, "weight", val)}
                  />
                  <TouchableOpacity
                    style={styles.deleteSetBtn}
                    onPress={() => handleDeleteSet(exIndex, setIndex)}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>x</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={() => handleAddSet(exIndex)}>
                <Text style={styles.addBtnText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addExerciseBtn} onPress={handleAddExercise}>
            <Text style={styles.addBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWorkout}>
            <Text style={styles.saveBtnText}>Save Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    paddingTop: Platform.OS === 'web' ? 24 : 0,
    borderRadius:20,
  },
  cardContainer: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  workoutNameInput: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 12,
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
  },
  exerciseCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  exerciseNotes: {
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    color: '#333'
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setLabel: { width: 60, fontWeight: '600', color: '#333' },
  setInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    paddingVertical: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  addSetBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseBtn: {
    backgroundColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16},
  saveBtn: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteSetBtn: {
    marginLeft: 8,
    backgroundColor: '#a43535ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteExerciseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#a43535ff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default ExerciseLogScreen;
