// screens/MealLogScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import MealEntryCard from "../../components/meal-card";
import RecentMealSummary from "../../components/recent-meal-card";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/** Types for navigation (adjust as needed) */
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  MealLog: undefined;
};

type MealLogNavigationProp = NativeStackNavigationProp<RootStackParamList, "MealLog">;

export default function MealLogScreen() {
  const navigation = useNavigation<MealLogNavigationProp>();
  const [isRecentMealVisible, setIsRecentMealVisible] = useState(false);

  function toggleRecentMealView() {
    setIsRecentMealVisible((prev) => !prev);
  }

  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Meals</Text>

        <TouchableOpacity style={styles.button} onPress={toggleRecentMealView}>
          <Text style={styles.buttonText}>
            {isRecentMealVisible ? "Hide Recent Meal" : "Show Recent Meal"}
          </Text>
        </TouchableOpacity>

        {isRecentMealVisible && <RecentMealSummary />}

        <MealEntryCard />
      </ScrollView>

      <BottomNavigation navigation={navigation} />
    </View>
  );
}

function BottomNavigation({ navigation }: { navigation: MealLogNavigationProp }) {
  return (
    <View style={styles.bottomTabs}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Image source={require("../../assets/images/home.png")} style={styles.navIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Image source={require("../../assets/images/user.png")} style={styles.navIcon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Image source={require("../../assets/images/settings.png")} style={styles.navIcon} />
      </TouchableOpacity>
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
    width: "100%",
    gap: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
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
