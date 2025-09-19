import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ExerciseCard = () => {
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
          <Text>Sets</Text>
          <Text style={styles.staticValue}>3</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text>Reps</Text>
          <Text style={styles.staticValue}>12</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCFCFC',
    borderRadius: 20,
    padding: 70,
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
  staticValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default ExerciseCard;