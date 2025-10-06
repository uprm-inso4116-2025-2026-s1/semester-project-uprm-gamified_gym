import React from 'react';
import {View,Text,StyleSheet,Image,TextInput,TouchableOpacity,Keyboard,Alert,} from 'react-native';

const ExerciseCard = () => {

  const defaultSets = 3;
  const defaultReps = 12;

  //keep input strings while the user is typing
  const [inputSets, setInputSets] = React.useState<string>('');
  const [inputReps, setInputReps] = React.useState<string>('');

  //Final logged number as integers
  const [loggedSets, setLoggedSets] = React.useState<number | null>(null);
  const [loggedReps, setLoggedReps] = React.useState<number | null>(null);

  const [isLogging, setIsLogging] = React.useState(false);
  
 const handleSaveLog = () => {
    if(!inputSets || !inputReps){
      Alert.alert('please log both sets and reps');
      return;
    } 

    const sets = parseInt(inputSets, 10);
    const reps = parseInt(inputReps, 10);

    // check if inputs are valid numbers
    if (isNaN(sets) || isNaN(reps)) {
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
        <Text style={{ marginTop: 10 }}>
          Logged: {loggedSets} sets × {loggedReps} reps
        </Text>
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
});

export default ExerciseCard;