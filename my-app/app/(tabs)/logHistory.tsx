import React, { useEffect, useState } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { supabase } from "../../lib/supabaseClient";

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null); // Track which menu is open

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('date_completed', { ascending: false });
    if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      Alert.alert('Error', 'Could not load workout history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
        console.log('Deleting workout with id:', id);
        const { error } = await supabase.from('workout_logs').delete().eq('id', id);
        if (error) throw error;
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
        console.error('Error deleting workout:', error);
        Alert.alert('Error', 'Could not delete workout.');
    }
  };

  const confirmDelete = (id: number) => {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to delete this workout?');
        if (confirmed) handleDelete(id);
    } else {
        Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
        ],
        { cancelable: true }
      );
    }
  };

    useFocusEffect(
      React.useCallback(() => {
        fetchWorkouts();
      }, [])
    );

  const renderWorkout = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.exercise_name}</Text>
        <Text style={styles.details}>
          {item.sets} sets × {item.reps} reps
        </Text>
        <Text style={styles.date}>
          {new Date(item.date_completed).toLocaleString()}
        </Text>
      </View>

      <View style={{ position: 'relative' }}>
        {/* Three-dot button */}
        <TouchableOpacity
          style={styles.threeDots}
          onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
        >
          <Text style={styles.threeDotsText}>⋮</Text>
        </TouchableOpacity>

        {/* Dropdown menu */}
        {openMenuId === item.id && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setOpenMenuId(null);
                confirmDelete(item.id);
              }}
            >
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setOpenMenuId(null);
                // Future Edit function
                console.log('Edit workout', item.id);
              }}
            >
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout History</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : workouts.length === 0 ? (
        <Text>No workouts logged yet.</Text>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWorkout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FCFCFC',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000000ff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1, 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 15,
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  threeDots: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
  },
  menu: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
    minWidth: 100,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
