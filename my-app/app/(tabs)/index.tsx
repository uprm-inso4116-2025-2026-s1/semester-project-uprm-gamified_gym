import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "./authContext";
import { useWorkoutsSupabase } from "./workoutStoreSupabase";
import { useAchievementsSupabase } from "./achievementStoreSupabase";
import { supabase } from "../../lib/supabaseClient";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  index: undefined;
  Profile: undefined;
  ExerciseLibrary: undefined;
  WorkoutHistory: undefined;
  Achievements: undefined;
  ExerciseDetail: { exercise: any; index: number };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "index">;

const MOTIVATIONAL_QUOTES = [
  "Every workout counts!",
  "You're stronger than yesterday!",
  "Push yourself, because no one else will!",
  "Success starts with self-discipline!",
  "Your only limit is you!",
  "Make today count!",
  "Train like a champion!",
  "Consistency is key!",
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { workoutHistory, getWorkoutStats, refreshWorkouts } = useWorkoutsSupabase();
  const { achievements, stats: achievementStats } = useAchievementsSupabase();
  const workoutStats = getWorkoutStats();

  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Random motivational quote
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  const fetchProfilePicture = useCallback(async () => {
    try {
      console.log("Fetching profile picture...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        return;
      }

      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("User ID:", user.id);

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles_test")
        .select("profile_picture_url")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        return;
      }

      console.log("Profile data:", profileData);
      console.log("Profile picture URL:", profileData?.profile_picture_url);

      if (profileData?.profile_picture_url) {
        // Remove any existing timestamp from the URL
        const baseUrl = profileData.profile_picture_url.split('?')[0];
        // Add a new timestamp to bust cache
        const urlWithTimestamp = `${baseUrl}?t=${Date.now()}`;
        console.log("Setting profile picture URL:", urlWithTimestamp);
        setProfilePictureUrl(urlWithTimestamp);
      } else {
        console.log("No profile picture URL found");
        setProfilePictureUrl(null);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  }, []);

  // Refresh profile picture and workout data (which updates achievements) when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfilePicture();
      refreshWorkouts();
    }, [fetchProfilePicture, refreshWorkouts])
  );

  // Get today's workouts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWorkouts = workoutHistory.filter((workout) => {
    const workoutDate = new Date(workout.date_completed);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });

  // Get closest achievements to unlock
  const closestAchievements = achievements
    .filter((a) => a.progress > 0 && a.progress < a.target)
    .sort((a, b) => {
      const aPercent = a.progress / a.target;
      const bPercent = b.progress / b.target;
      return bPercent - aPercent;
    })
    .slice(0, 3);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authContainer}>
          <LinearGradient
            colors={["#2E89FF", "#1E5FCC"]}
            style={styles.authGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="barbell" size={80} color="#fff" />
            <Text style={styles.authTitle}>Gamified Gym</Text>
            <Text style={styles.authSubtitle}>Track your fitness journey</Text>

            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => navigation.navigate("SignUp")}
                activeOpacity={0.8}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={["#2E89FF", "#1E5FCC"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>{user?.email?.split("@")[0] || "Champion"}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              {profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={48} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.quote}>{quote}</Text>
        </LinearGradient>

        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={styles.statIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="barbell" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["#F7B731", "#FC4A1A"]}
                style={styles.statIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="flame" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>{workoutStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={styles.statIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>{achievementStats.completed}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate("WorkoutHistory")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.todayCard}>
            {todayWorkouts.length > 0 ? (
              <View style={styles.todayContent}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                <Text style={styles.todayTitle}>Great Job!</Text>
                <Text style={styles.todayText}>
                  You've completed {todayWorkouts.length} workout{todayWorkouts.length !== 1 ? "s" : ""} today
                </Text>
                <View style={styles.todayStats}>
                  {todayWorkouts.map((workout, index) => (
                    <Text key={index} style={styles.todayWorkoutName}>
                      {workout.workout_name}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.todayContent}>
                <Ionicons name="fitness" size={48} color="#999" />
                <Text style={styles.todayTitle}>No Workouts Yet</Text>
                <Text style={styles.todayText}>Start your first workout of the day!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("ExerciseLibrary")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="list" size={32} color="#fff" />
                <Text style={styles.actionText}>Browse Exercises</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("WorkoutHistory")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#45B7D1", "#96E6A1"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time" size={32} color="#fff" />
                <Text style={styles.actionText}>Workout History</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Achievements")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#FFD93D", "#F39C12"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={32} color="#fff" />
                <Text style={styles.actionText}>Achievements</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#FF9FF3", "#FDA7DF"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={32} color="#fff" />
                <Text style={styles.actionText}>My Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievement Progress */}
        {closestAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Almost There!</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Achievements")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {closestAchievements.map((achievement) => {
              const progressPercent = Math.round((achievement.progress / achievement.target) * 100);
              return (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementHeader}>
                    <View style={styles.achievementInfo}>
                      <Ionicons name={achievement.icon as any} size={24} color="#2E89FF" />
                      <View style={styles.achievementText}>
                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementDescription}>
                          {achievement.progress} / {achievement.target}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.achievementPercent}>{progressPercent}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Workouts */}
        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity onPress={() => navigation.navigate("WorkoutHistory")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {workoutHistory.slice(0, 3).map((workout, index) => {
              const workoutDate = new Date(workout.date_completed);
              const daysAgo = Math.floor(
                (new Date().getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutIcon}>
                    <Ionicons name="fitness" size={24} color="#2E89FF" />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.workout_name}</Text>
                    <Text style={styles.workoutDetails}>
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""} •{" "}
                      {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  authContainer: {
    flex: 1,
  },
  authGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  authTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginTop: 24,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 60,
  },
  authButtons: {
    width: "100%",
    gap: 16,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E89FF",
  },
  signupButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
    textTransform: "capitalize",
  },
  profileButton: {
    width: 48,
    height: 48,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  quote: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E89FF",
  },
  todayCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  todayContent: {
    alignItems: "center",
  },
  todayTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  todayText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  todayStats: {
    alignItems: "center",
    gap: 4,
  },
  todayWorkoutName: {
    fontSize: 14,
    color: "#2E89FF",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    aspectRatio: 1.3,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  achievementCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: "#666",
  },
  achievementPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E89FF",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2E89FF",
    borderRadius: 3,
  },
  workoutCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 13,
    color: "#666",
  },
});
