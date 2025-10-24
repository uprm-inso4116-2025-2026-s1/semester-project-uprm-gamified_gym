import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,        // ← added
  SafeAreaView,      // ← optional but nice for notches
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  ActiveUserProfile,
  fetchActiveUserProfile,
} from "../../lib/profileApi";

export default function Profile() {
  const [profile, setProfile] = useState<ActiveUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
            <View style={styles.avatarPlaceholder}>
              {profile?.profilePictureUrl ? (
                <Image
                  source={{ uri: profile.profilePictureUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={60} color="#666" />
              )}
            </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- scroll container ---
  safe: { flex: 1, backgroundColor: "#3b82f6" },
  scroll: { flex: 1 },
  // Keeps your original “card sits near bottom” feel, while allowing scroll.
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32, // prevents last button hugging the edge
  },

  // --- original styles preserved ---
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
  avatarPlaceholder: {
    backgroundColor: "#eee",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
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
