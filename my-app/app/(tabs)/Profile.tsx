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
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import PartialFillCard from "../../components/progress";

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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user");

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles_test")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

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

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const formatDOB = (dob?: string | null) => {
    if (!dob) return "Unavailable";
    const d = new Date(dob);
    return Number.isNaN(d.getTime()) ? dob : d.toLocaleDateString();
  };

  const onChangeAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access.");
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
      Alert.alert("Upload failed", err?.message ?? "Please try again.");
    } finally {
      setUploading(false);
    }
  }, [profile?.profileId]);

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.infoText}>Email: {profile.email}</Text>
                <Text style={styles.infoText}>Username: {profile.username}</Text>
                <Text style={styles.infoText}>Gender: {profile.gender}</Text>
                <Text style={styles.infoText}>Date of Birth: {formatDOB(profile.dateOfBirth)}</Text>
                <Text style={styles.infoText}>First Name: {profile.firstName}</Text>
                <Text style={styles.infoText}>Last Name: {profile.lastName}</Text>
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

        {/* XP / Partial Fill */}
        <View style={styles.partialFillContainer}>
          <PartialFillCard />
        </View>
      </ScrollView>

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
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 25,
    paddingTop: 15,
    paddingBottom: 110,
  },
  profileCard: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 23,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
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
  profileInfo: { alignItems: "center", marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: "#111" },
  subtitleHandle: { fontSize: 14, color: "#3b82f6", marginBottom: 10 },
  loader: { marginBottom: 10 },
  statusText: { color: "#374151", fontSize: 16, textAlign: "center", marginBottom: 10 },
  statusTextError: { color: "#b91c1c" },
  infoText: {
    backgroundColor: "rgba(114,167,255,0.85)",
    color: "#111",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 3,
    fontSize: 15,
    width: "85%",
    textAlign: "center",
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "70%",
  },
  badgeImage: { width: 40, height: 40, resizeMode: "contain" },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "80%",
    marginVertical: 20,
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  refreshText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  partialFillContainer: {
    marginTop: 25,
    width: "92%",
    borderRadius: 23,
  },
  bottomTabs: {
  position: "absolute",
  backgroundColor: "#ffffff",
  bottom: 20,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  width: "90%", // narrower than full width for the floating effect
  height: 65,
  borderRadius: 35,
  alignSelf: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },  //MEJORAR: AÑADIR ANIMACION DE LA PAGINA QUE SE ENCUENTRA ACTIVA, AGRANDAR Y PONER AZUL EJ
  shadowOpacity: 0.25,
  shadowRadius: 5,
  elevation: 6, // for Android shadow
  paddingHorizontal: 30,
},
  navIcon: { width: 28, height: 28, resizeMode: "contain", tintColor: "#000000ff" },
});
