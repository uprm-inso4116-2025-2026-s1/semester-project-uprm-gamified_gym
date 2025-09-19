import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        {/* Header with avatar on the right */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>HOME</Text>
            <Text style={styles.subtitle}>Welcome back, USER!</Text>
          </View>

          {/* Avatar (right side) */}
          <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrap}>
            <Image
              // Local placeholder — swap for your real image
              source={require("../../assets/images/user.png")}
              // For remote image, use: source={{ uri: "https://your-cdn.com/avatar.jpg" }}
              style={styles.avatar}
              accessibilityLabel="User profile"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: "#FFEB0C" }]}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>2,345</Text>
          </View>

          <Image
            source={require("../../assets/images/athletics.png")}
            style={styles.runningIcon}
          />

          <View style={[styles.statBox, { backgroundColor: "#FF59B7" }]}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>400</Text>
          </View>
        </View>

        <Text style={styles.quickTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.calendarBox}>
          <Image
            source={require("../../assets/images/calendar.png")}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomTabs}>
        <Image
          source={require("../../assets/images/home.png")}
          style={styles.navIcon}
        />
        <Image
          source={require("../../assets/images/user.png")}
          style={styles.navIcon}
        />
        <Image
          source={require("../../assets/images/settings.png")}
          style={styles.navIcon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  cardContainer: {
    width: "92%",
    height: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 20,
    marginTop: 15,
    alignItems: "center",
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },

  /* New header with right-side avatar */
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexShrink: 1,
    paddingRight: 12,
  },
  avatarWrap: {
    borderRadius: 999,
    padding: 2,
    backgroundColor: "#EAF2FF",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#2E89FF",
  },

  /* (Old header kept in case you need it elsewhere)
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  }, */

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E89FF",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 10,
    color: "#2E89FF",
    textAlign: "left",
    marginBottom: 0,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "95%",
  },
  statBox: {
    width: 100,
    height: 80,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statLabel: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#3b3b3bff",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  runningIcon: {
    width: 55,
    height: 55,
    marginHorizontal: 10,
    resizeMode: "contain",
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#2E89FF",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2E89FF",
    paddingHorizontal: 10,
    borderRadius: 23,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
  calendarBox: {
    width: "90%",
    height: 195,
    borderRadius: 10,
    backgroundColor: "#2E89FF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  calendarIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 20,
    resizeMode: "contain",
  },
  navIcon: {
    width: 29,
    height: 29,
    marginHorizontal: 20,
    resizeMode: "contain",
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#2E89FF",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
    height: 50,
    paddingBottom: 18,
  },
});
