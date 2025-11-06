import { supabase } from "../../lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import PartialFillCard from "../../components/progress"

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

import {
  ActiveUserProfile,
  uploadAvatarToSupabase,
  updateProfilePictureUrl,
} from "../../lib/profileApi";

export default function Profile() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<ActiveUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No authenticated user");

    // Fetch the profile from your table
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles_test")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // Map the table fields to your ActiveUserProfile
    const activeProfile: ActiveUserProfile = {
      profileId: profileData.id,
      id: profileData.id,
      fullName: `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`,
      username: profileData.username ?? "",
      email: profileData.email ?? user.email ?? "",
      gender: profileData.gender ?? "",
      dateOfBirth: profileData.date_of_birth ?? null,
      firstName: profileData.first_name ?? "",
      lastName: profileData.last_name ?? "",
      profilePictureUrl: profileData.avatar_url ?? "",
      bio: profileData.bio ?? "",
      updatedAt: profileData.updated_at ?? null,
    };

      setProfile(activeProfile);
    } catch (err: any) {
      const message =
        err?.message ??
        "Something went wrong while loading your profile. Please try again later.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const formatDOB = (dob?: string | null) => {
    if (!dob) return "Unavailable";
    const d = new Date(dob);
    return Number.isNaN(d.getTime()) ? dob : d.toLocaleDateString();
  };

  const onChangeAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to change your profile picture."
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

      setUploading(true);
      const publicUrl = await uploadAvatarToSupabase(asset.uri, profile?.profileId);
      await updateProfilePictureUrl(publicUrl, profile?.profileId);

      setProfile((p) => (p ? { ...p, profilePictureUrl: publicUrl } : p));
      Alert.alert("Updated", "Your profile picture was updated.");
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Upload failed",
        err?.message ?? "We couldn't update your photo. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }, [profile?.profileId]);

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.contentContainer}>
        <View style={styles.profileCard}>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarTouchable}
            activeOpacity={0.8}
            onPress={onChangeAvatar}
            disabled={uploading}
          >
            <View style={styles.avatarPlaceholder}>
              {profile?.profilePictureUrl ? (
                <Image
                  source={{ uri: profile.profilePictureUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={60} color="#666" />
              )}
              <View style={styles.cameraBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.sectionTitle}>
              {loading
                ? "Loading profile..."
                : profile?.fullName || profile?.username || "Profile"}
            </Text>

            {!loading && !error && profile?.username && (
              <Text style={styles.subtitleHandle}>@{profile.username}</Text>
            )}

            {loading && <ActivityIndicator style={styles.loader} color="#3b82f6" size="large" />}
            {!loading && error && (
              <Text style={[styles.statusText, styles.statusTextError]}>{error}</Text>
            )}

            {!loading && !error && profile && (
              <>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Email: {profile.email || "Unavailable"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Username: {profile.username ?? "Unavailable"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Gender: {profile.gender ?? "Unavailable"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Date of Birth: {formatDOB(profile.dateOfBirth)}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>First Name: {profile.firstName ?? "Unavailable"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Last Name: {profile.lastName ?? "Unavailable"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.separator} />

          {/* Badges */}
          <View style={styles.badgesRow}>
            <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
            <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
            <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
          </View>

          {/* Refresh Button */}
          <TouchableOpacity style={styles.refreshButton} onPress={loadProfile}>
            <Text style={styles.refreshText}>Refresh Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Partial Fill / XP Progress */}
      <View style={{ marginTop: 0, width: "98%", marginBottom: 70, borderRadius: 23 }}>
        <PartialFillCard />
      </View>

      {/* Bottom Navigation */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#2E89FF",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  profileCard: {
    width: "92%",
    height: "88%",
    backgroundColor: "#fff",
    borderRadius: 23,
    padding: 20,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
  },
  profileInfo: { width: "90%", alignItems: "center" },
  avatarTouchable: { marginBottom: 10 },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: { width: 90, height: 90, borderRadius: 50 },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    backgroundColor: "#3b82f6",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  subtitleHandle: { fontSize: 14, color: "#3b82f6", marginBottom: 10 },
  loader: { marginBottom: 10 },
  statusText: {
    color: "#374151",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  statusTextError: { color: "#b91c1c" },
  infoButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 3,
    width: "80%",
    alignItems: "center",
  },
  infoText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "80%",
  },
  badgeImage: { width: 40, height: 40, resizeMode: "contain" },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "80%",
    marginVertical: 20,
  },
  refreshButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  refreshText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  bottomTabs: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2E89FF",
    width: "100%",
    height: 85,
    alignItems: "center",
    paddingHorizontal: 42,
    paddingTop: 17,
  },
  navIcon: { width: 29, height: 29, resizeMode: "contain" },
});
