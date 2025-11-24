import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabaseClient";
import { uploadProfilePictureAndUpdateRecord } from "../../lib/profileApi";
import { useWorkoutsSupabase } from "./workoutStoreSupabase";
import { useAchievementsSupabase } from "./achievementStoreSupabase";
import { useAuth } from "./authContext";

type RootStackParamList = {
  index: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Achievements: undefined;
  WorkoutHistory: undefined;
  ExerciseLibrary: undefined;
};

type UserProfile = {
  profileId: string;
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender: string;
  dateOfBirth: string | null;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  bio: string;
  updatedAt: string | null;
};

export default function Profile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { workoutHistory, getWorkoutStats } = useWorkoutsSupabase();
  const { achievements, stats: achievementStats } = useAchievementsSupabase();
  const workoutStats = getWorkoutStats();

  const [authenticatedUser, setAuthenticatedUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setIsProfileLoading] = useState(true);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [error, setProfileError] = useState<string | null>(null);

  // Fetch the currently authenticated user from Supabase
  useEffect(() => {
    const retrieveAuthenticatedUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Failed to retrieve authenticated user", error);
        setProfileError("Failed to get authenticated user.");
        setIsProfileLoading(false);
        return;
      }

      setAuthenticatedUser(user);
    };

    retrieveAuthenticatedUser();
  }, []);

  // Load the authenticated user's profile from Supabase
  const loadActiveUserProfile = useCallback(async () => {
    if (!authenticatedUser) return;

    try {
      setIsProfileLoading(true);
      setProfileError(null);

      const { data: profileData, error: profileFetchError } = await supabase
        .from("user_profiles_test")
        .select("*")
        .eq("id", authenticatedUser.id)
        .single();

      if (profileFetchError) throw profileFetchError;

      const formattedProfile = {
        profileId: profileData.id,
        id: profileData.id,
        fullName: `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`.trim(),
        username: profileData.username ?? "",
        email: profileData.email ?? authenticatedUser.email ?? "",
        gender: profileData.gender ?? "",
        dateOfBirth: profileData.date_of_birth ?? null,
        firstName: profileData.first_name ?? "",
        lastName: profileData.last_name ?? "",
        profilePictureUrl: profileData.profile_picture_url ?? "",
        bio: profileData.bio ?? "",
        updatedAt: profileData.updated_at ?? null,
      };

      setUserProfile(formattedProfile);
    } catch (err: any) {
      console.error(err);
      setProfileError(err?.message ?? "Failed to load profile information.");
    } finally {
      setIsProfileLoading(false);
    }
  }, [authenticatedUser]);

  useFocusEffect(
    useCallback(() => {
      loadActiveUserProfile();
    }, [loadActiveUserProfile])
  );

  // Change avatar - show options to take photo or choose from library
  const handleProfilePictureUpdate = useCallback(async () => {
    if (!userProfile) return;

    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission Needed",
                  "Please allow camera access to take a photo."
                );
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (result.canceled) return;
              const asset = result.assets?.[0];
              if (!asset?.uri) return;

              setIsAvatarUploading(true);

              const publicUrl = await uploadProfilePictureAndUpdateRecord(
                userProfile.profileId,
                asset.uri
              );

              setUserProfile((p) => (p ? { ...p, profilePictureUrl: publicUrl } : p));
              Alert.alert("Success", "Profile picture updated!");
            } catch (err: any) {
              console.error(err);
              Alert.alert("Error", err?.message ?? "Failed to update profile picture.");
            } finally {
              setIsAvatarUploading(false);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission Needed",
                  "Please allow access to your photo library."
                );
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (result.canceled) return;
              const asset = result.assets?.[0];
              if (!asset?.uri) return;

              setIsAvatarUploading(true);

              const publicUrl = await uploadProfilePictureAndUpdateRecord(
                userProfile.profileId,
                asset.uri
              );

              setUserProfile((p) => (p ? { ...p, profilePictureUrl: publicUrl } : p));
              Alert.alert("Success", "Profile picture updated!");
            } catch (err: any) {
              console.error(err);
              Alert.alert("Error", err?.message ?? "Failed to update profile picture.");
            } finally {
              setIsAvatarUploading(false);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }, [userProfile]);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            navigation.navigate("index");
          },
        },
      ]
    );
  };

  // Get personal records
  const personalRecords = {
    longestStreak: Math.max(workoutStats.currentStreak, 0),
    totalExercises: workoutStats.totalExercises,
    thisWeekWorkouts: workoutHistory.filter((w) => {
      const workoutDate = new Date(w.date_completed);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length,
  };

  // Get recent achievements
  const recentAchievements = achievements
    .filter((a) => a.progress >= a.target)
    .slice(0, 4);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E89FF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadActiveUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
        {/* Header with Profile Picture */}
        <LinearGradient
          colors={["#2E89FF", "#1E5FCC"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleProfilePictureUpdate}
            activeOpacity={0.8}
            disabled={isAvatarUploading}
          >
            <View style={styles.avatarWrapper}>
              {userProfile?.profilePictureUrl ? (
                <Image
                  source={{ uri: userProfile.profilePictureUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={56} color="#fff" />
                </View>
              )}
              {isAvatarUploading ? (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              ) : (
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.tapToChangeText}>Tap to change</Text>
          </TouchableOpacity>

          <Text style={styles.userName}>
            {userProfile?.fullName || userProfile?.username || "User"}
          </Text>
          {userProfile?.username && (
            <Text style={styles.userHandle}>@{userProfile.username}</Text>
          )}
          {userProfile?.bio && (
            <Text style={styles.userBio}>{userProfile.bio}</Text>
          )}
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
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
              <Text style={styles.statLabel}>Total Workouts</Text>
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
          </View>

          <View style={styles.statsRow}>
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

            <View style={styles.statCard}>
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                style={styles.statIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="fitness" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.statValue}>{personalRecords.thisWeekWorkouts}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
          </View>

          <View style={styles.recordCard}>
            <View style={styles.recordItem}>
              <Ionicons name="flame" size={24} color="#F7B731" />
              <View style={styles.recordInfo}>
                <Text style={styles.recordLabel}>Longest Streak</Text>
                <Text style={styles.recordValue}>{personalRecords.longestStreak} days</Text>
              </View>
            </View>

            <View style={styles.recordDivider} />

            <View style={styles.recordItem}>
              <Ionicons name="fitness" size={24} color="#4ECDC4" />
              <View style={styles.recordInfo}>
                <Text style={styles.recordLabel}>Total Exercises</Text>
                <Text style={styles.recordValue}>{personalRecords.totalExercises}</Text>
              </View>
            </View>

            <View style={styles.recordDivider} />

            <View style={styles.recordItem}>
              <Ionicons name="calendar" size={24} color="#667EEA" />
              <View style={styles.recordInfo}>
                <Text style={styles.recordLabel}>This Week</Text>
                <Text style={styles.recordValue}>{personalRecords.thisWeekWorkouts} workouts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Achievements")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.achievementsGrid}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementBadge}>
                  <Ionicons
                    name={achievement.icon as any}
                    size={32}
                    color="#FFD93D"
                  />
                  <Text style={styles.achievementBadgeText} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userProfile?.email || "Not set"}</Text>
              </View>
            </View>

            {userProfile?.gender && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{userProfile.gender}</Text>
                  </View>
                </View>
              </>
            )}

            {userProfile?.dateOfBirth && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>
                      {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.7}
          >
            <Ionicons name="settings" size={24} color="#2E89FF" />
            <Text style={styles.actionButtonText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("WorkoutHistory")}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={24} color="#2E89FF" />
            <Text style={styles.actionButtonText}>Workout History</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Achievements")}
            activeOpacity={0.7}
          >
            <Ionicons name="trophy" size={24} color="#2E89FF" />
            <Text style={styles.actionButtonText}>Achievements</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2E89FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 32,
    paddingTop: 24,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tapToChangeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    fontWeight: "600",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  userBio: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    maxWidth: "80%",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
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
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
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
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  recordDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementBadge: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
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
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutText: {
    color: "#FF6B6B",
  },
});
