import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import ExerciseCard from "../../components/exercise-card";
import RecentWorkoutCard from "../../components/recent-workout-card";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabaseClient"; // <- make sure this path is correct

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

type Session = {
  id: string;
  title: string | null;
  notes: string | null;
  started_at: string | null;
};

export default function ExerciseLog() {
  const navigation = useNavigation<ExerciseLogScreenNavigationProp>();
  const [showRecent, setShowRecent] = useState(false);
  const [recent, setRecent] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showRecent) return;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("workout_sessions")
          .select("id, title, notes, started_at")
          .order("started_at", { ascending: false })
          .limit(1);

        if (error) throw error;
        setRecent(data && data.length ? (data[0] as Session) : null);
      } catch (e: any) {
        Alert.alert("Error loading recent workout", e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [showRecent]);

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

        {showRecent && (
          <View style={{ width: "90%", alignItems: "stretch" }}>
             <RecentWorkoutCard />

            <View style={styles.recentCard}>
              <Text style={styles.recentTitle}>Most Recent Workout</Text>
              <View style={{ marginTop: 6, gap: 2 }}>
                <Text>Title: {recent?.title ?? "—"}</Text>
                <Text>
                  Date:{" "}
                  {recent?.started_at
                    ? new Date(recent.started_at).toLocaleDateString()
                    : "—"}
                </Text>
              </View>

              {loading ? (
                <ActivityIndicator style={{ marginTop: 10 }} />
              ) : recent ? (
                <Link href={`/workouts/${recent.id}/edit`} asChild>
                  <TouchableOpacity style={styles.editBtn}>
                    <Text style={{ fontWeight: "600" }}>Edit</Text>
                  </TouchableOpacity>
                </Link>
              ) : null}
            </View>
          </View>
        )}

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
  recentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  editBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
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
