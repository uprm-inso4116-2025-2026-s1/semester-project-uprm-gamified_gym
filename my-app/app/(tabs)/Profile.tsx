import React, { useEffect, useState, useCallback } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import {
  ActiveUserProfile,
  fetchActiveUserProfile,
  uploadAvatarToSupabase,
  updateProfilePictureUrl,
} from "../../lib/profileApi";
import PartialFillCard from "../../components/progress"

export default function Profile() {
  const [profile, setProfile] = useState<ActiveUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeProfile = await fetchActiveUserProfile();
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const formatDOB = (dob?: string | null) => {
    if (!dob) return "Unavailable";
    const d = new Date(dob);
    return isNaN(d.getTime()) ? dob : d.toLocaleDateString();
  };

  const onChangeAvatar = useCallback(async () => {
    try {
      // Ask permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to change your profile picture."
        );
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // crop
        aspect: [1, 1],      // square avatar
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setUploading(true);

      // Upload to Supabase Storage and get a public URL
      const publicUrl = await uploadAvatarToSupabase(asset.uri, profile?.profileId);

      // Save URL in your profile table (or via your API)
      await updateProfilePictureUrl(publicUrl, profile?.profileId);

      // Update local UI instantly
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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.profileCard}>
            {/* Avatar (now touchable) */}
            <TouchableOpacity
              style={styles.avatarTouchable}
              activeOpacity={0.8}
              onPress={onChangeAvatar}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
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

                {/* camera badge */}
                <View style={styles.cameraBadge}>
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              {loading
                ? "Loading profile..."
                : profile?.fullName || profile?.username || "Profile"}
            </Text>

            {!loading && !error && profile?.username && (
              <Text style={styles.subtitleHandle}>@{profile.username}</Text>
            )}

            {loading && (
              <ActivityIndicator
                style={styles.loader}
                color="#3b82f6"
                size="large"
              />
            )}
            {!loading && error && (
              <Text style={[styles.statusText, styles.statusTextError]}>
                {error}
              </Text>
            )}

            {/* Only the 6 fields */}
            {!loading && !error && profile && (
              <>
                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    Email: {profile.email || "Unavailable"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    Username: {profile.username ?? "Unavailable"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    Gender: {profile.gender ?? "Unavailable"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    Date of Birth: {formatDOB(profile.dateOfBirth)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    First Name: {profile.firstName ?? "Unavailable"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
                  <Text style={styles.infoText}>
                    Last Name: {profile.lastName ?? "Unavailable"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {!loading && !error && !profile && (
              <Text style={styles.statusText}>No profile data available.</Text>
            )}

            <View style={styles.separator} />

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Image
                  source={require("../../assets/images/medal.png")}
                  style={styles.badgeImage}
                />
              </View>
              <View style={styles.badge}>
                <Image
                  source={require("../../assets/images/medal.png")}
                  style={styles.badgeImage}
                />
              </View>
              <View style={styles.badge}>
                <Image
                  source={require("../../assets/images/medal.png")}
                  style={styles.badgeImage}
                />
              </View>
            </View>

            {!loading && !error && (
              <TouchableOpacity style={styles.refreshButton} onPress={loadProfile}>
                <Text style={styles.refreshText}>Refresh Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View>
          <PartialFillCard />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#3b82f6" },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32,
  },

  container: {
    width: "100%",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    minHeight: 500,
  },

  avatarTouchable: { marginBottom: 15 },
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
  avatarImage: { width: 100, height: 100, borderRadius: 50 },

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

  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  subtitleHandle: { fontSize: 14, color: "#3b82f6", marginBottom: 20 },
  loader: { marginBottom: 20 },
  statusText: {
    color: "#374151",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  statusTextError: { color: "#b91c1c" },
  infoButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  infoText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    width: "80%",
  },
  badge: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  badgeImage: { width: 36, height: 36, resizeMode: "contain" },
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
});
