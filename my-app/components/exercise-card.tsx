import React from 'react';
import {View,Text,StyleSheet,Image,TextInput,TouchableOpacity,Keyboard,Alert,} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const exerciseName = "Push-Up"

  //keep input strings while the user is typing
  const [inputSets, setInputSets] = React.useState<string>('');
  const [inputReps, setInputReps] = React.useState<string>('');

  //Final logged number as integers
  const [loggedSets, setLoggedSets] = React.useState<number | null>(null);
  const [loggedReps, setLoggedReps] = React.useState<number | null>(null);

  const [isLogging, setIsLogging] = React.useState(false);
  
 const handleSaveLog = async () => {
    if(!inputSets || !inputReps){
      Alert.alert('please log both sets and reps');
      return;
    } 

    const sets = parseInt(inputSets, 10);
    const reps = parseInt(inputReps, 10);

    // check if inputs are valid numbers
    if (isNaN(sets) || isNaN(reps) || sets <= 0 || reps <= 0) {
      Alert.alert('Invalid input', 'Sets and reps must be valid numbers.');
      return;
    }

  
    // check if inputs are greater than 0
    if (sets <= 0 || reps <= 0) {
    Alert.alert('Invalid input', 'Sets and reps must be greater than 0');
    return;
  }

    setLoggedSets(sets);
    setLoggedReps(reps);

    setInputSets('');
    setInputReps('');
    setIsLogging(false);
    Keyboard.dismiss();

    console.log('Workout logged (integers);', {sets, reps});

    try {
      const workoutData = {
        exerciseName,
        sets,
        reps,
        dateCompleted: new Date().toISOString(),
      };

      await AsyncStorage.setItem('mostRecentWorkout', JSON.stringify(workoutData));
      console.log('Saved most recent workout:', workoutData);
    } catch (error) {
      console.error('Error saving workout:', error);
    }


    //Save sets/reps integers to database here......


    //.............................................
    
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Push-Up</Text>
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

          <TouchableOpacity style={styles.doneButton} onPress={handleSaveLog}>
            <Text style={styles.buttonText}>Done</Text>
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
            Logged: {loggedSets} sets × {loggedReps} reps
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
    width: 80,
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