import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView, Easing } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export default function ActivityScreen() {
  const [currentExercise, setCurrentExercise] = useState("Chest Press");
  const totalSets = 5;
  const totalReps = 12;
  const repDuration = 3000; // 3s per rep
  const restDuration = 10000; // 10s rest

  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(restDuration / 1000);
  const [showNextChoices, setShowNextChoices] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const repAnim = useRef(new Animated.Value(0)).current;

  const radius = 100;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  // Reset timer function - FIXED VERSION
  const resetTimer = () => {
    setIsResetting(true);
    
    // Reset all states in a batch
    setCurrentSet(1);
    setCurrentRep(0);
    setCompletedSets(0);
    setIsResting(false);
    setRestTimeLeft(restDuration / 1000);
    setShowNextChoices(false);
    repAnim.setValue(0);
    
    // Small delay to ensure all states are updated before allowing new interactions
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  // Animate reps ring
  const animateRepRing = () => {
    if (isResetting) return;
    
    repAnim.setValue(0);
    Animated.timing(repAnim, {
      toValue: 1,
      duration: repDuration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  // Handle reps loop - FIXED with reset check
  useEffect(() => {
    if (isResetting) return;
    
    if (!isResting && currentRep < totalReps) {
      animateRepRing();
      const timeout = setTimeout(() => {
        if (!isResetting) {
          setCurrentRep((prev) => prev + 1);
        }
      }, repDuration);
      return () => clearTimeout(timeout);
    } else if (!isResting && currentRep === totalReps) {
      startRest();
    }
  }, [currentRep, isResting, isResetting]);

  const rotateRep = repAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const startRest = () => {
    if (isResetting) return;
    
    setIsResting(true);
    setRestTimeLeft(restDuration / 1000);

    const interval = setInterval(() => {
      if (isResetting) {
        clearInterval(interval);
        return;
      }
      
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          completeSet();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (isResetting) return;
    completeSet();
  };

  const completeSet = () => {
    if (isResetting) return;
    
    setIsResting(false);
    setCompletedSets((prev) => prev + 1);

    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
      setCurrentRep(0);
    } else {
      setShowNextChoices(true);
    }
  };

  // Mini Boss handler - FIXED
  const handleMiniBoss = () => {
    resetTimer();
    setTimeout(() => {
      setCurrentExercise("Dragon Press 💪");
    }, 150);
  };

  // Normal Exercise handler - FIXED
  const handleNormalExercise = () => {
    resetTimer();
    setTimeout(() => {
      setCurrentExercise("Incline Bench Press");
    }, 150);
  };

  // Render set segments - FIXED with reset check
  const renderSetSegments = () => {
    const segments = [];
    const gap = 4;
    const anglePerSegment = 360 / totalSets;
    const segmentLength = (circumference * (anglePerSegment - gap)) / 360;

    for (let i = 0; i < totalSets; i++) {
      const startAngle = -90 + i * anglePerSegment + gap / 2;
      // Ensure segments are only filled if we're not resetting and completedSets is accurate
      const isFilled = !isResetting && i < completedSets;
      
      segments.push(
        <Circle
          key={i}
          cx="120"
          cy="120"
          r={radius}
          stroke={isFilled ? "#4ADE80" : "#E5E7EB"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
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
      <Text style={styles.exerciseTitle}>{currentExercise}</Text>

      <View style={styles.circleWrapper}>
        <Svg width={240} height={240} style={styles.svgContainer}>
          <G>{renderSetSegments()}</G>
        </Svg>

        {!isResetting && (
          <Animated.View
            style={[styles.repRing, { transform: [{ rotate: rotateRep }] }]}
          />
        )}

        <View style={styles.circleCenter}>
          <Text style={styles.setText}>Set {currentSet}/{totalSets}</Text>
          <Text style={styles.repText}>
            Rep {Math.min(currentRep, totalReps)}/{totalReps}
          </Text>
          {isResting && !isResetting && <Text style={styles.restText}>Rest: {restTimeLeft}s</Text>}
        </View>
      </View>

      {/* Skip Rest button */}
      {isResting && !showNextChoices && !isResetting && (
        <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      )}

      {/* Next exercise choices */}
      {showNextChoices && !isResetting && (
        <View style={styles.nextContainer}>
          <Text style={styles.nextText}>Choose your next challenge</Text>
          <Text style={styles.completedText}>✅ Workout Completed!</Text>
          
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceCard, { backgroundColor: "#DCFCE7" }]}
              onPress={handleNormalExercise}
              disabled={isResetting}
            >
              <Text style={styles.choiceTitle}>Regular Exercise</Text>
              <Text style={styles.choiceDesc}>Balanced intensity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceCard, { backgroundColor: "#FEE2E2" }]}
              onPress={handleMiniBoss}
              disabled={isResetting}
            >
              <Text style={styles.choiceTitle}>Mini Boss</Text>
              <Text style={styles.choiceDesc}>Harder, more XP 💪</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Show loading state during reset */}
      {isResetting && (
        <View style={styles.resettingOverlay}>
          <Text style={styles.resettingText}>Starting new exercise...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    backgroundColor: "#F5FAFF",
  },
  exerciseTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 40,
    textAlign: "center",
  },
  circleWrapper: { 
    width: 240, 
    height: 240, 
    justifyContent: "center", 
    alignItems: "center",
    marginVertical: 20,
  },
  svgContainer: {
    position: "absolute",
  },
  circleCenter: { 
    alignItems: "center",
    justifyContent: "center",
  },
  setText: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: "#111827" 
  },
  repText: { 
    fontSize: 16, 
    color: "#374151", 
    marginTop: 6 
  },
  restText: { 
    fontSize: 16, 
    color: "#F59E0B", 
    marginTop: 4 
  },
  repRing: { 
    position: "absolute", 
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4, 
    borderColor: "#FACC15", 
    borderTopColor: "transparent", 
    borderLeftColor: "transparent", 
    borderRightColor: "transparent" 
  },
  skipButton: { 
    marginTop: 20, 
    backgroundColor: "#2563EB", 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 30 
  },
  skipText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
  nextContainer: { 
    marginTop: 40, 
    alignItems: "center",
    paddingHorizontal: 20,
  },
  nextText: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 10,
    textAlign: "center",
  },
  completedText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
    marginBottom: 20,
  },
  choiceRow: { 
    flexDirection: "row", 
    gap: 16,
    width: "100%",
  },
  choiceCard: { 
    flex: 1, 
    borderRadius: 20, 
    padding: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    elevation: 4,
    minHeight: 120,
  },
  resettingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 250, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resettingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
  },
});