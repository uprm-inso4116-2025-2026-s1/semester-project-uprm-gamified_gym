import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabaseClient';

type RootStackParamList = {
  Home: undefined;
  ExerciseLog: undefined;
};

type ExerciseCardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ExerciseLog'
>;

const ExerciseCard = () => {
  const navigation = useNavigation<ExerciseCardNavigationProp>();

  const defaultSets = 3;
  const defaultReps = 12;
  const defaultExerciseName = "Push-Up";

  //keep input strings while the user is typing
  const [inputSets, setInputSets] = React.useState<string>('');
  const [inputReps, setInputReps] = React.useState<string>('');
  const [inputName, setInputName] = React.useState<string>('');

  //Final logged number as integers
  const [loggedSets, setLoggedSets] = React.useState<number | null>(null);
  const [loggedReps, setLoggedReps] = React.useState<number | null>(null);
  const [loggedName, setLoggedName] = React.useState<string>('');
  const [isLogging, setIsLogging] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSaveLog = async () => {
    if (!inputSets || !inputReps) {
      Alert.alert('Please log both sets and reps');
      return;
    } 

    const sets = parseInt(inputSets, 10);
    const reps = parseInt(inputReps, 10);

    // check if inputs are valid numbers
    if (isNaN(sets) || isNaN(reps) || sets <= 0 || reps <= 0) {
      Alert.alert('Invalid input', 'Sets and reps must be valid numbers.');
      return;
    }

    const workoutName = inputName.trim() !== '' ? inputName : defaultExerciseName;

    setLoggedSets(sets);
    setLoggedReps(reps);
    setLoggedName(workoutName);
    setInputSets('');
    setInputReps('');
    setInputName('');
    setIsLogging(false);
    Keyboard.dismiss();

    const workoutData = {
      exercise_name: workoutName,
      sets,
      reps,
      date_completed: new Date().toISOString(),
    };

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('workout_logs')  // we need to make sure the table name is like this!
        .insert([workoutData]);

      setLoading(false);

      if (error) {
        console.error('Supabase insert error:', error);
        Alert.alert('Error saving workout', error.message);
      } else {
        console.log('Workout saved:', data);
        Alert.alert('Workout logged successfully!');
      }
    } catch (err) {
      setLoading(false);
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{"Example: Push-Up"}</Text>
      <Text style={styles.description}>
        A bodyweight exercise that primarily targets the chest, triceps, and shoulders.
      </Text>
      <Image
        style={styles.image}
        source={require('../assets/images/push-up.png')}
        resizeMode="cover"
      />

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text>Recommended Sets</Text>
          <Text style={styles.staticValue}>{defaultSets}</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text>Recommended Reps</Text>
          <Text style={styles.staticValue}>{defaultReps}</Text>
        </View>
      </View>

      {isLogging && (
        <>
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text>Workout Name</Text>
            <TextInput
              style={styles.input}
              placeholder={defaultExerciseName}
              value={inputName}
              onChangeText={setInputName}
            />
          </View>

          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={styles.inputGroup}>
              <Text>Sets Completed</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={inputSets}
                onChangeText={(val) => setInputSets(val.replace(/[^0-9]/g, ''))}
                placeholder="1+"
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text>Reps Completed</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={inputReps}
                onChangeText={(val) => setInputReps(val.replace(/[^0-9]/g, ''))}
                placeholder="1+"
                maxLength={3}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneButton, loading && { opacity: 0.7 }]}
            onPress={handleSaveLog}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging...' : 'Done'}</Text>
          </TouchableOpacity>
        </>
      )}

      {!isLogging && (
        <TouchableOpacity style={styles.button} onPress={() => setIsLogging(true)}>
          <Text style={styles.buttonText}>Log Workout</Text>
        </TouchableOpacity>
      )}

      {/* Display logged integers */}
      {loggedSets !== null && loggedReps !== null && (
        <View style={styles.loggedRow}>
          <Text style={styles.loggedText}>
            Logged "{loggedName}": {loggedSets} sets × {loggedReps} reps
          </Text>
          <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.smallButtonText}>Home</Text>
          </TouchableOpacity>
      </View>
      )}

    </View>

    

  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCFCFC',
    borderRadius: 20,
    padding: 20,
    margin: 18,
    elevation: 3,
    shadowColor: '#000000ff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    width: '95%', // Make card almost full width
    alignSelf: 'center', // Center the card
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    color: '#000000ff',
  },
  image: {
    width: '100%',
    height: 70,
    backgroundColor: '#000000ff',
    marginBottom: 16,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
  },

  input:{
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    minWidth: 60,
    maxWidth: 120,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: '#fff',
  },

  staticValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },

  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  doneButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },

  loggedText: {
    fontSize: 16,
    flex: 1,
  },

  smallButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },

  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExerciseCard;

// on the suppabase we need to create a table named "workout_logs" with the columns:
// id (primary key, auto-increment)
// exercise_name (text)
// sets (integer)
// reps (integer)
// date_completed (time)