// import React, { useState, useEffect, useRef } from "react";
// import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Easing } from "react-native";
// import Svg, { Circle, G } from "react-native-svg";
// import { supabase } from "../../lib/supabaseClient";

// export default function TimerScreen({ route }) {
//   // const { workoutId, repTime = 3, restTime = 20 } = route.params; // seconds
//   const params = route?.params || {};
//   const workoutId = params.workoutId;
//   const repTime = params.repTime || 3;
//   const restTime = params.restTime || 20;


//   // ----- Workout and Exercise State -----
//   const [exercises, setExercises] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [currentRep, setCurrentRep] = useState(0);
//   const [currentSet, setCurrentSet] = useState(1);
//   const [isResting, setIsResting] = useState(false);
//   const [restLeft, setRestLeft] = useState(0);
//   const [countdown, setCountdown] = useState(3);
//   const [showNextChoices, setShowNextChoices] = useState(false);

//   const repAnim = useRef(new Animated.Value(0)).current;
//   const overlayOpacity = useRef(new Animated.Value(1)).current;

//   const repTimeoutRef = useRef<number | null>(null);
//   const restIntervalRef = useRef<number | null>(null);

//   const radius = 100;
//   const strokeWidth = 12;
//   const circumference = 2 * Math.PI * radius;

//   // ----- Fetch Workout -----
//   useEffect(() => {
//     if (!workoutId) return;
//     const fetchWorkout = async () => {
//       const { data, error } = await supabase
//         .from("preset_workouts")
//         .select("title, exercises")
//         .eq("id", workoutId)
//         .single();
//       if (error) return console.error(error);
//       setExercises(data.exercises || []);
//     };
//     fetchWorkout();
//   }, [workoutId]);

//   // ----- Countdown -----
//   useEffect(() => {
//     if (countdown <= 0) return;
//     const interval = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           Animated.timing(overlayOpacity, {
//             toValue: 0,
//             duration: 500,
//             useNativeDriver: true,
//           }).start(() => {
//             setCurrentRep(0);
//           });
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [countdown]);

//   // ----- Clear timers -----
//   const clearRepTimeout = () => {
//     if (repTimeoutRef.current != null) clearTimeout(repTimeoutRef.current);
//   };
//   const clearRestInterval = () => {
//     if (restIntervalRef.current != null) clearInterval(restIntervalRef.current);
//   };

//   // ----- Animate rep ring -----
//   const animateRep = () => {
//     repAnim.setValue(0);
//     Animated.timing(repAnim, {
//       toValue: 1,
//       duration: repTime * 1000,
//       easing: Easing.linear,
//       useNativeDriver: true,
//     }).start();
//   };

//   // ----- Main Timer Loop -----
//   useEffect(() => {
//     if (countdown > 0) return;
//     if (!exercises[currentIndex]) return;
//     const exercise = exercises[currentIndex];
//     const totalReps = exercise.reps || 12;
//     const totalSets = exercise.sets || 1;

//     if (isResting) return;

//     if (currentRep < totalReps) {
//       clearRepTimeout();
//       animateRep();
//       repTimeoutRef.current = setTimeout(() => {
//         setCurrentRep(prev => prev + 1);
//       }, repTime * 1000);
//     } else {
//       // Start rest when reps done
//       startRest();
//     }

//     return () => clearRepTimeout();
//   }, [currentRep, isResting, currentIndex, exercises, countdown]);

//   // ----- Start Rest -----
//   const startRest = () => {
//     clearRestInterval();
//     setIsResting(true);
//     setRestLeft(restTime);

//     restIntervalRef.current = setInterval(() => {
//       setRestLeft(prev => {
//         if (prev <= 1) {
//           clearRestInterval();
//           completeSet();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // ----- Complete Set -----
//   const completeSet = () => {
//     clearRepTimeout();
//     setIsResting(false);
//     setCurrentRep(0);
//     const exercise = exercises[currentIndex];
//     const totalSets = exercise.sets || 1;

//     if (currentSet < totalSets) {
//       setCurrentSet(prev => prev + 1);
//     } else if (currentIndex < exercises.length - 1) {
//       setCurrentIndex(prev => prev + 1);
//       setCurrentSet(1);
//       setCurrentRep(0);
//     } else {
//       setShowNextChoices(true);
//     }
//   };

//   // ----- Skip Rest -----
//   const skipRest = () => {
//     clearRestInterval();
//     setIsResting(false);
//     setRestLeft(0);
//     completeSet();
//   };

//   // ----- Cleanup -----
//   useEffect(() => {
//     return () => {
//       clearRepTimeout();
//       clearRestInterval();
//     };
//   }, []);

//   const rotate = repAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   const exercise = exercises[currentIndex] || { name: "", reps: 0, sets: 1 };

//   const renderSegments = () => {
//     const segments = [];
//     const gap = 4;
//     const anglePerSegment = 360 / (exercise.sets || 1);
//     const segLength = (circumference * (anglePerSegment - gap)) / 360;

//     for (let i = 0; i < (exercise.sets || 1); i++) {
//       const startAngle = -90 + i * anglePerSegment + gap / 2;
//       const filled = i < currentSet - 1;
//       segments.push(
//         <Circle
//           key={i}
//           cx="120"
//           cy="120"
//           r={radius}
//           stroke={filled ? "#4ADE80" : "#E5E7EB"}
//           strokeWidth={strokeWidth}
//           strokeLinecap="round"
//           fill="transparent"
//           strokeDasharray={`${segLength} ${circumference - segLength}`}
//           rotation={startAngle}
//           originX="120"
//           originY="120"
//         />
//       );
//     }
//     return segments;
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>{exercise.name}</Text>

//       <View style={styles.circleWrapper}>
//         <Svg width={240} height={240} style={styles.svg}>
//           <G>{renderSegments()}</G>
//         </Svg>

//         <Animated.View style={[styles.repRing, { transform: [{ rotate }] }]} />

//         <View style={styles.center}>
//           <Text style={styles.setText}>Set {currentSet}/{exercise.sets || 1}</Text>
//           <Text style={styles.repText}>Rep {Math.min(currentRep, exercise.reps || 12)}/{exercise.reps || 12}</Text>
//           {isResting && <Text style={styles.restText}>Rest: {restLeft}s</Text>}
//         </View>
//       </View>

//       {isResting && !showNextChoices && (
//         <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
//           <Text style={styles.skipText}>Skip Rest</Text>
//         </TouchableOpacity>
//       )}

//       {countdown > 0 && (
//         <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
//           <Text style={styles.overlayText}>{countdown === 0 ? "GO!" : countdown}</Text>
//         </Animated.View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80, backgroundColor: "#F5FAFF" },
//   title: { fontSize: 28, fontWeight: "700", marginBottom: 40, textAlign: "center" },
//   circleWrapper: { width: 240, height: 240, justifyContent: "center", alignItems: "center", marginVertical: 20 },
//   svg: { position: "absolute" },
//   center: { alignItems: "center", justifyContent: "center" },
//   setText: { fontSize: 22, fontWeight: "700", color: "#111827" },
//   repText: { fontSize: 16, color: "#374151", marginTop: 6 },
//   restText: { fontSize: 16, color: "#F59E0B", marginTop: 4 },
//   repRing: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 4, borderColor: "#FACC15", borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent" },
//   skipButton: { marginTop: 20, backgroundColor: "#2563EB", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30 },
//   skipText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", zIndex: 999 },
//   overlayText: { fontSize: 90, color: "white", fontWeight: "900" },
// });



///////////////////////////////////
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Alert } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function TimerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const workoutId = params.workoutId as string;
  const workoutType = params.type as "preset" | "routine";
  const repTimeNum = Number(params.repTime) || 3;
  const restTimeGlobal = Number(params.restTime) || 20;

  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const repAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const repTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const radius = 100;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  // --- Reset workout variables ---
  const resetWorkoutState = () => {
    setCurrentIndex(0);
    setCurrentRep(0);
    setCurrentSet(1);
    setIsResting(false);
    setRestLeft(0);
    setCountdown(3);
    setWorkoutComplete(false);
    repAnim.setValue(0);
    overlayOpacity.setValue(1);
    if (repTimeoutRef.current) clearTimeout(repTimeoutRef.current);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
  };

  // --- Load workout ---
  useEffect(() => {
    const table = workoutType === "preset" ? "preset_workouts" : "routines";

    const loadWorkout = async () => {
      const { data, error } = await supabase
        .from(table)
        .select("id, title, exercises")
        .eq("id", workoutId)
        .single();

      if (error || !data) {
        console.error(error);
        Alert.alert("Error", "Could not load workout.");
        router.back();
        return;
      }

      setWorkout(data);
      resetWorkoutState(); // Reset state whenever a new workout is loaded
      setLoading(false);
    };

    loadWorkout();
  }, [workoutId]);

  // --- Countdown overlay ---
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // --- Animate rep ring ---
  const animateRep = (onComplete?: () => void) => {
  repAnim.setValue(0);
  Animated.timing(repAnim, {
    toValue: 1,
    duration: repTimeNum * 1000,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start(({ finished }) => {
    if (finished && onComplete) onComplete();
  });
};
  // --- Timer / reps logic ---
  useEffect(() => {
  if (countdown > 0 || !workout?.exercises?.[currentIndex] || workoutComplete) return;
  const exercise = workout.exercises[currentIndex];
  const totalReps = exercise.target_reps || 12;

  if (isResting) return;

  if (currentRep < totalReps) {
    if (repTimeoutRef.current) clearTimeout(repTimeoutRef.current);
    animateRep(() => {
      setCurrentRep(prev => prev + 1);
    });
  } else {
    // Ensure progress ring is full before rest
    repAnim.setValue(1);
    startRest();
  }

  return () => repTimeoutRef.current && clearTimeout(repTimeoutRef.current);
}, [currentRep, isResting, currentIndex, workout, countdown, workoutComplete]);


  // --- Start rest ---
  const startRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    const exercise = workout.exercises[currentIndex];
    const actualRest = exercise.rest_seconds ?? restTimeGlobal;

    setIsResting(true);
    setRestLeft(actualRest);

    restIntervalRef.current = setInterval(() => {
      setRestLeft(prev => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!);
          completeSet();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // --- Complete set / exercise ---
  const completeSet = () => {
  if (repTimeoutRef.current) clearTimeout(repTimeoutRef.current);
  if (restIntervalRef.current) clearInterval(restIntervalRef.current);

  const exercise = workout.exercises[currentIndex];
  const totalSets = exercise.target_sets || 1;

  if (currentSet < totalSets) {
    setCurrentSet(prev => prev + 1);
    setCurrentRep(0);
    setIsResting(false);
    setRestLeft(0);
  } else if (currentIndex < workout.exercises.length - 1) {
    setCurrentIndex(prev => prev + 1);
    setCurrentSet(1);
    setCurrentRep(0);
    setIsResting(false);
    setRestLeft(0);
  } else {
    // Last exercise complete
    repAnim.setValue(1); // fill the ring fully
    setWorkoutComplete(true);

    // Optionally reset after a short delay
    setTimeout(() => {
      resetWorkoutState();
    }, 2000); // 2 sec delay to show completion
  }
};

  const skipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setIsResting(false);
    setRestLeft(0);
    completeSet();
  };

  useEffect(() => {
    return () => {
      if (repTimeoutRef.current) clearTimeout(repTimeoutRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  const rotate = repAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (loading) {
    return (
      <View style={[styles.container]}>
        <Text style={{ color: "#fff" }}>Loading workout...</Text>
      </View>
    );
  }

  if (workoutComplete) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 28, color: "#fff", fontWeight: "700", marginBottom: 20 }}>
          🎉 Workout Complete!
        </Text>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push("/Home")}>
          <Text style={styles.skipText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exercise = workout.exercises[currentIndex];

  const renderSegments = () => {
  const segments = [];
  const gap = 4;
  const totalSets = exercise.target_sets || 1;
  const anglePerSegment = 360 / totalSets;
  const segLength = (circumference * (anglePerSegment - gap)) / 360;

  for (let i = 0; i < totalSets; i++) {
    const startAngle = -90 + i * anglePerSegment + gap / 2;

    let fillRatio = 0;
    if (i < currentSet - 1) {
      fillRatio = 1; // Completed sets are fully filled
    } else if (i === currentSet - 1) {
      // Current set fills proportionally to reps
      const currentReps = Math.min(currentRep, exercise.target_reps);
      fillRatio = currentReps / exercise.target_reps;
    }

    segments.push(
      <Circle
        key={i}
        cx="120"
        cy="120"
        r={radius}
        stroke="#4ADE80"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray={`${segLength * fillRatio} ${circumference - segLength * fillRatio}`}
        rotation={startAngle}
        originX="120"
        originY="120"
      />
    );
  }
  return segments;
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{exercise.exercise_name}</Text>

      <View style={styles.circleWrapper}>
        <Svg width={240} height={240} style={styles.svg}>
          <G>{renderSegments()}</G>
        </Svg>

        <Animated.View style={[styles.repRing, { transform: [{ rotate }] }]} />

        <View style={styles.center}>
          <Text style={styles.setText}>
            Set {currentSet}/{exercise.target_sets}
          </Text>
          <Text style={styles.repText}>
            Rep {Math.min(currentRep, exercise.target_reps)}/{exercise.target_reps}
          </Text>
          {isResting && <Text style={styles.restText}>Rest: {restLeft}s</Text>}
        </View>
      </View>

      {isResting && (
        <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      )}

      {countdown > 0 && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Text style={styles.overlayText}>{countdown === 0 ? "GO!" : countdown}</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80, backgroundColor: "#2E89FF" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 40, textAlign: "center", color: "#fff" },
  circleWrapper: { width: 240, height: 240, justifyContent: "center", alignItems: "center", marginVertical: 20 },
  svg: { position: "absolute" },
  center: { alignItems: "center", justifyContent: "center" },
  setText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  repText: { fontSize: 16, color: "#E0E0E0", marginTop: 6 },
  restText: { fontSize: 16, color: "#FACC15", marginTop: 4 },
  repRing: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 4, borderColor: "#FACC15", borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent" },
  skipButton: { marginTop: 20, backgroundColor: "#2563EB", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30 },
  skipText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", zIndex: 999 },
  overlayText: { fontSize: 90, color: "white", fontWeight: "900" },
});
