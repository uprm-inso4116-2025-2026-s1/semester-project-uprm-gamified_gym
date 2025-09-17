import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={60} color="#666" />
        </View>
        <Text style={styles.sectionTitle}>YOUR PROFILE</Text>

        {/* Info buttons */}
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoText}>Email</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Badges row */}
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Image source={require('../../assets/images/medal.png')} style={styles.badgeImage} />
          </View>
          <View style={styles.badge}>
            <Image source={require('../../assets/images/medal.png')} style={styles.badgeImage} />
          </View>
          <View style={styles.badge}>
            <Image source={require('../../assets/images/medal.png')} style={styles.badgeImage} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3b82f6",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileCard: {
    marginTop: 20,
    marginBottom: 0,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  infoButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 18,
    width: "80%",
    alignItems: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
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
  badgeImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "80%",
    marginVertical: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
});
