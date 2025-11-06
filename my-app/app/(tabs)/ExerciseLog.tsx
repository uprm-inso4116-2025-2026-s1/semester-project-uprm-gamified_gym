import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import ExerciseCard from "../../components/exercise-card";
import RecentWorkoutCard from "../../components/recent-workout-card";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ExerciseLog: undefined;
};

type ExerciseLogScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExerciseLog"
>;

export default function ExerciseLog() {
  const navigation = useNavigation<ExerciseLogScreenNavigationProp>();
  const [showRecent, setShowRecent] = useState(false);

  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Exercises</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowRecent(!showRecent)}
        >
          <Text style={styles.buttonText}>
            {showRecent ? "Hide Recent Workout" : "Show Recent Workout"}
          </Text>
        </TouchableOpacity>

        {showRecent && <RecentWorkoutCard />}

        <ExerciseCard />
        <ExerciseCard />
        <ExerciseCard />
      </ScrollView>

      <View style={styles.bottomTabs}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image
            source={require("../../assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={require("../../assets/images/user.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={require("../../assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#2E89FF",
    alignItems: "center",
    paddingTop: 60,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 120,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#2E89FF",
    fontWeight: "600",
    fontSize: 16,
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#ffffff",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 35,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    paddingHorizontal: 30,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#000000ff",
  },
});
