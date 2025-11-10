import { createClient } from '@supabase/supabase-js'

// Needs to be filled with supabase info and table name for storing and loading workout logs 
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
const table = 'workout_log'


const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Workout save
async function addEntry(workout, set, repetition, time_stamp) {
    // Explicit constraint 
    // Set and reppetitions can not be 0, to prevent illegal opertions and useless log.   
     if(set == 0 || repetitions == 0){
        return;
    }
    const { data, error } = await supabase
    .from(table) 
    // Pass an array, even for a single entry, blue brakets is the array, we can add mulitple entries in the same function if added to this array
    .insert([{workouts: workout, sets: set, repetitions: repetition, time_stamps: time_stamp}]) 
    //.select() // Optional: Returns the inserted data
      if (error) {
        console.error('Error inserting data:', error)
      } else {
        console.log('Data inserted successfully:', data)
      }
    }

// Workout load, uses time stamp to return all the workouts of that day with sets and reps
async function getWorkoutLogs(time_stamp) {
  const { data, error } = await supabase
    .from(table)
    .select('workouts, sets, repetitions') // Select only the required columns
    .eq('time_stamps', time_stamp); // Filter by the specific timestamp

  if (error) {
    console.error('Error retrieving workout details:', error);
    return [];
  }

  return data;
}
// addEntry()
// getWorkoutLogs()