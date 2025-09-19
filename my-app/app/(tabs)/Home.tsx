import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <View style={styles.outerContainer}> {/* New outer container */}
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HOME</Text>
          <Text style={styles.subtitle}>Welcome back, USER!</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Steps */}
          <View style={[styles.statBox, { backgroundColor: "#FFEB0C" }]}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>2,345</Text>
          </View>

        {/* Running Icon */}
        <Image
          source={require("../../assets/images/athletics.png")}
          style={styles.runningIcon}
        />

        {/* Calories */}
        <View style={[styles.statBox, { backgroundColor: "#FF59B7" }]}>
          <Text style={styles.statLabel}>Calories</Text>
          <Text style={styles.statValue}>400</Text>
        </View>
      </View>

        {/* Quick Actions */}
        <Text style={styles.quickTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <TouchableOpacity style={styles.calendarBox}>
          <Image
          source={require("../../assets/images/calendar.png")}
          style={styles.calendarIcon}
        />
        </TouchableOpacity>
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        {/* Home Logo */}
        <Image
          source={require("../../assets/images/home.png")}
          style={styles.navIcon}
        />
        {/* Profile Logo */}
        <Image
          source={require("../../assets/images/user.png")}
          style={styles.navIcon}
        />
        {/* Settings Logo */}
        <Image
          source={require("../../assets/images/settings.png")}
          style={styles.navIcon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { // Page Background
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    paddingTop: 0, 
  },
  cardContainer: { // Main white card
    width: '92%',
    height: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 23, // Round corner card
    padding: 20,
    marginTop: 15,
    alignItems: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
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
    shadowColor: "#000", // Add shadow for depth
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.20,
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
  resizeMode: "contain", // keeps proportions
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#2E89FF",
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between the buttons
    width: "100%",
    marginVertical: 15,
  },
  actionButton: {
    flex: 1, // Align buttons
    backgroundColor: "#2E89FF",
    paddingHorizontal: 10,
    borderRadius: 23,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: 'bold',
  },
  calendarBox: {
    width: '90%',
    height: 195,
    borderRadius: 10,
    backgroundColor: "#2E89FF", 
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  navIcon: {
  width: 29,
  height: 29,
  marginHorizontal: 20,
  resizeMode: "contain",
  },
  calendarIcon: {
  width: 50,
  height: 50,
  marginHorizontal: 20,
  resizeMode: "contain",
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#2E89FF",
    bottom: 0, // At the bottom
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'center',
    width: "80%",
    height: 50,
    paddingBottom: 18,
  },
});