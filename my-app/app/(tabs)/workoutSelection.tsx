// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { supabase } from "../../lib/supabaseClient";

// type RootStackParamList = {
//   Home: undefined;
//   Profile: undefined;
//   Settings: undefined;
//   TimerScreen: {
//     workoutId: string | null;
//     repTime: number;
//     restTime: number;
//   };
//   CreateWorkout: undefined;
// };

// type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// export default function WorkoutSelectionScreen() {
//   const navigation = useNavigation<NavProp>();

//   const [repTime, setRepTime] = useState(1);
//   const [restTime, setRestTime] = useState(20);
//   const [workouts, setWorkouts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);


//   async function fetchWorkouts() {
//     const { data, error } = await supabase
//       .from("workouts")
//       .select("*");

//     if (error) {
//       console.log(error);
//       return;
//     }
//     setWorkouts(data || []);
//     setLoading(false);
//   }

//   useEffect(() => {
//     fetchWorkouts();
//   }, []);

//   return (
//     <View style={styles.background}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.header}>Choose Your Workout</Text>

//         {/* Preset workouts */}
//         <Text style={styles.sectionTitle}>Your Workouts</Text>

//         {loading ? (
//           <Text style={{ color: "white" }}>Loading...</Text>
//         ) : workouts.length === 0 ? (
//           <Text style={styles.emptyText}>No workouts found.</Text>
//         ) : (
//           workouts.map((w) => (
//             <TouchableOpacity
//                 key={w.id}
//                 style={[
//                     styles.workoutCard,
//                     selectedWorkout === w.id && { borderColor: "#FFD700", borderWidth: 3 },
//                 ]}
//                 onPress={() => setSelectedWorkout(w.id)}
//                 >
//                 <Text style={styles.workoutName}>{w.name}</Text>
//                 <Text style={styles.workoutInfo}>
//                     {w.exercises?.length || 0} exercises
//                 </Text>
//             </TouchableOpacity>

//           ))
//         )}

//         {/* Create new workout */}
//         <TouchableOpacity
//           style={styles.createButton}
//           onPress={() => navigation.navigate("ExerciseLog")}
//         >
//           <Text style={styles.createButtonText}>+ Create New Workout</Text>
//         </TouchableOpacity>

//         {/* --- Settings Section --- */}
//         <Text style={styles.sectionTitle}>Timer Settings</Text>

//         {/* Time per rep */}
//         <View style={styles.settingRow}>
//           <Text style={styles.settingLabel}>Seconds per rep</Text>
//           <View style={styles.counterRow}>
//             <TouchableOpacity
//               style={styles.counterBtn}
//               onPress={() => setRepTime((r) => Math.max(1, r - 1))}
//             >
//               <Text style={styles.counterText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.counterValue}>{repTime}s</Text>
//             <TouchableOpacity
//               style={styles.counterBtn}
//               onPress={() => setRepTime((r) => r + 1)}
//             >
//               <Text style={styles.counterText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Rest time */}
//         <View style={styles.settingRow}>
//           <Text style={styles.settingLabel}>Rest between exercises</Text>
//           <View style={styles.counterRow}>
//             <TouchableOpacity
//               style={styles.counterBtn}
//               onPress={() => setRestTime((r) => Math.max(5, r - 5))}
//             >
//               <Text style={styles.counterText}>-</Text>
//             </TouchableOpacity>
//             <Text style={styles.counterValue}>{restTime}s</Text>
//             <TouchableOpacity
//               style={styles.counterBtn}
//               onPress={() => setRestTime((r) => r + 5)}
//             >
//               <Text style={styles.counterText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//         <TouchableOpacity
//             style={[styles.startButton, !selectedWorkout && { opacity: 0.5 }]}
//             onPress={() => {
//                 // For now, we will navigate even if selectedWorkout is null.
//                 navigation.navigate("TimerScreen", {
//                     workoutId: selectedWorkout,
//                     repTime,
//                     restTime,
//                 });
//             }}
//             >
//             <Text style={styles.startButtonText}>Start Workout</Text>
//         </TouchableOpacity>



//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     backgroundColor: "#2E89FF",
//     paddingTop: 50,
//   },
//   container: {
//     alignItems: "center",
//     paddingBottom: 50,
//   },
//   header: {
//     color: "white",
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     color: "white",
//     fontSize: 20,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   emptyText: {
//     color: "white",
//     opacity: 0.8,
//   },
//   workoutCard: {
//     width: "90%",
//     backgroundColor: "white",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 10,
//   },
//   workoutName: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   workoutInfo: {
//     fontSize: 14,
//     opacity: 0.7,
//   },
//   createButton: {
//     backgroundColor: "#FFFFFF",
//     padding: 15,
//     width: "90%",
//     marginTop: 10,
//     borderRadius: 15,
//     alignItems: "center",
//   },
//   createButtonText: {
//     color: "#2E89FF",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   settingRow: {
//     width: "90%",
//     backgroundColor: "white",
//     borderRadius: 15,
//     padding: 15,
//     marginVertical: 10,
//   },
//   settingLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   counterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   counterBtn: {
//     width: 45,
//     height: 45,
//     borderRadius: 10,
//     backgroundColor: "#2E89FF",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   counterText: {
//     color: "white",
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   counterValue: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   startButton: {
//     backgroundColor: "#FFD700",
//     padding: 18,
//     width: "90%",
//     borderRadius: 15,
//     alignItems: "center",
//     marginTop: 20,
//     },
//    startButtonText: {
//     color: "#000",
//     fontSize: 20,
//     fontWeight: "800",
//     },
// });



// //////////////////////////
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "expo-router";

export default function WorkoutSelectionScreen() {
  const router = useRouter();

  const [repTime, setRepTime] = useState(3);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const sessionLoaded = useRef(false);

  // Load Supabase session once
  useEffect(() => {
    if (sessionLoaded.current) return;
    sessionLoaded.current = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.log("Session error:", error);
        setSession(data.session || null);
      } catch (err) {
        console.log("Unexpected session error:", err);
      }
    };

    loadSession();
  }, []);

  // Fetch workouts after session loads
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("routines")
          .select("*");

        if (error) throw error;

        setWorkouts(data || []);
      } catch (err) {
        console.log("Fetch workouts error:", err);
        Alert.alert("Error", "Could not fetch workouts.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // Start the workout
  const handleStartWorkout = () => {
    if (!selectedWorkout?.id) {
      Alert.alert("Select a workout", "Please select a workout first.");
      return;
    }

    router.push({
      pathname: "TimerScreen",
      params: {
        workoutId: selectedWorkout.id,   // <- required
        type: "routine",                 // <- or "preset" if applicable
        repTime: repTime.toString(),
      },
    });
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Choose Your Workout</Text>

        <Text style={styles.sectionTitle}>Your Workouts</Text>

        {loading ? (
          <Text style={{ color: "white" }}>Loading...</Text>
        ) : workouts.length === 0 ? (
          <Text style={styles.emptyText}>No workouts found.</Text>
        ) : (
          workouts.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.workoutCard,
                selectedWorkout?.id === w.id && {
                  borderColor: "#FFD700",
                  borderWidth: 3,
                },
              ]}
              onPress={() => setSelectedWorkout(w)}
            >
              <Text style={styles.workoutName}>{w.title}</Text>
              <Text style={styles.workoutInfo}>
                {Array.isArray(w.exercises) ? w.exercises.length : 0} exercises
              </Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("ExerciseLog")}
        >
          <Text style={styles.createButtonText}>+ Create New Workout</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Timer Settings</Text>

        {/* REP TIME */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Seconds per rep</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setRepTime((r) => Math.max(1, r - 1))}
            >
              <Text style={styles.counterText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{repTime}s</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setRepTime((r) => r + 1)}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* START BUTTON */}
        <TouchableOpacity
          style={[styles.startButton, !selectedWorkout && { opacity: 0.5 }]}
          disabled={!selectedWorkout}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#2E89FF", paddingTop: 50 },
  container: { alignItems: "center", paddingBottom: 50 },
  header: { color: "white", fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "700", marginTop: 10, marginBottom: 10 },
  emptyText: { color: "white", opacity: 0.8 },
  workoutCard: { width: "90%", backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 10 },
  workoutName: { fontSize: 18, fontWeight: "bold" },
  workoutInfo: { fontSize: 14, opacity: 0.7 },
  createButton: { backgroundColor: "#FFFFFF", padding: 15, width: "90%", marginTop: 10, borderRadius: 15, alignItems: "center" },
  createButtonText: { color: "#2E89FF", fontSize: 16, fontWeight: "700" },
  settingRow: { width: "90%", backgroundColor: "white", borderRadius: 15, padding: 15, marginVertical: 10 },
  settingLabel: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counterBtn: { width: 45, height: 45, borderRadius: 10, backgroundColor: "#2E89FF", alignItems: "center", justifyContent: "center" },
  counterText: { color: "white", fontSize: 22, fontWeight: "bold" },
  counterValue: { fontSize: 20, fontWeight: "700" },
  startButton: { backgroundColor: "#FFD700", padding: 18, width: "90%", borderRadius: 15, alignItems: "center", marginTop: 20 },
  startButtonText: { color: "#000", fontSize: 20, fontWeight: "800" },
});
