import { supabase } from "../../lib/supabaseClient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadProfilePictureAndUpdateRecord } from "../../lib/profileApi";
import PartialFillCard from "../../components/progress";


type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};



export default function Profile() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

  // Load the authenticated user’s profile from Supabase
  const loadActiveUserProfile  = useCallback(async () => {
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
        fullName: `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`,
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

  const formatDateOfBirth = (dob?: string | null) => {
    if (!dob) return "Unavailable";
    const d = new Date(dob);
    return Number.isNaN(d.getTime()) ? dob : d.toLocaleDateString();
  };

  // Change avatar using new uploadProfilePictureAndUpdateRecord function
  const handleProfilePictureUpdate = useCallback(async () => {
    if (!userProfile) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library to change your profile picture."
        );
        return;
      }

      const selectedImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (selectedImage.canceled) return;
      const asset = selectedImage.assets?.[0];
      if (!asset?.uri) return;

      setIsAvatarUploading(true);

      // Upload avatar and update profile
      const publicUrl = await uploadProfilePictureAndUpdateRecord(
        userProfile.profileId, 
        asset.uri
      );

      setUserProfile((p) => (p ? { ...p, profilePictureUrl: publicUrl } : p));
      Alert.alert("Profile Updated", "Your profile picture has been updated successfully.");
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Upload failed",
        err?.message ?? "Unable to update your photo. Please try again."
      );
    } finally {
      setIsAvatarUploading(false);
    }
  }, [userProfile]);

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
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarTouchable}
              activeOpacity={0.8}
              onPress={handleProfilePictureUpdate}
              disabled={isAvatarUploading}
            >
              <View style={styles.avatarPlaceholder}>
                {userProfile?.profilePictureUrl ? (
                  <Image
                    source={{ uri: userProfile.profilePictureUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={60} color="#666" />
                )}
                <View style={styles.cameraBadge}>
                  {isAvatarUploading ? (
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
                : userProfile?.fullName || userProfile?.username || "Profile"}
            </Text>
            {!loading && !error && userProfile?.username && (
              <Text style={styles.subtitleHandle}>@{userProfile.username}</Text>
            )}
            {loading && <ActivityIndicator style={styles.loader} color="#3b82f6" size="large" />}
            {!loading && error && (
              <Text style={[styles.statusText, styles.statusTextError]}>{error}</Text>
            )}

            {!loading && !error && userProfile && (
              <>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Email: {userProfile.email || "Unavailable"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Username: {userProfile.username ?? "Unavailable"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Gender: {userProfile.gender ?? "Unavailable"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Date of Birth: {formatDateOfBirth(userProfile.dateOfBirth)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>First Name: {userProfile.firstName ?? "Unavailable"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoText}>Last Name: {userProfile.lastName ?? "Unavailable"}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.separator} />

            {/* Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
              </View>
              <View style={styles.badge}>
                <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
              </View>
              <View style={styles.badge}>
                <Image source={require("../../assets/images/medal.png")} style={styles.badgeImage} />
              </View>
            </View>

            {!loading && !error && (
              <TouchableOpacity style={styles.refreshButton} onPress={loadActiveUserProfile}>
                <Text style={styles.refreshText}>Refresh Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View>
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
navIcon: { width: 28, height: 28, resizeMode: "contain", tintColor: "#000000ff" },

  safe: { flex: 1, backgroundColor: "#3b82f6" },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "flex-end", alignItems: "center", paddingTop: 16, paddingBottom: 100 },
  container: { width: "100%", alignItems: "center" },
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
  avatarPlaceholder: { backgroundColor: "#eee", borderRadius: 50, width: 100, height: 100, justifyContent: "center", alignItems: "center", overflow: "hidden", position: "relative" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  cameraBadge: { position: "absolute", right: -2, bottom: -2, backgroundColor: "#3b82f6", width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  subtitleHandle: { fontSize: 14, color: "#3b82f6", marginBottom: 20 },
  loader: { marginBottom: 20 },
  statusText: { color: "#374151", fontSize: 16, textAlign: "center", marginBottom: 20 },
  statusTextError: { color: "#b91c1c" },
  infoButton: { backgroundColor: "#3b82f6", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginVertical: 10, width: "80%", alignItems: "center" },
  infoText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  badgesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 25, width: "80%" },
  badge: { backgroundColor: "#3b82f6", borderRadius: 20, padding: 15, alignItems: "center", justifyContent: "center", width: 80, height: 80 },
  badgeImage: { width: 36, height: 36, resizeMode: "contain" },
  separator: { height: 1, backgroundColor: "#e5e7eb", width: "80%", marginVertical: 20 },
  refreshButton: { marginTop: 30, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#111827" },
  refreshText: { color: "#fff", fontSize: 14, fontWeight: "500" },
});
