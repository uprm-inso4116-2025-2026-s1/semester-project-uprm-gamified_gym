import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
          <View style={[styles.statBox, { backgroundColor: "#FFEB0C" }]}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>2,345</Text>
          </View>

          <Ionicons name="walk-outline" size={40} color="teal" />

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
        <TouchableOpacity style={styles.calendarBox}> {/* Changed to TouchableOpacity */}
          <Ionicons name="calendar-outline" size={50} color="black" />
        </TouchableOpacity>
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <Ionicons name="home" size={28} color="black" /> {/* Icons color black */}
        <Ionicons name="person" size={28} color="black" />
        <Ionicons name="settings" size={28} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { // Overall background for the page
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    paddingTop: 0, 
  },
  cardContainer: { // Main white card
    width: '90%', // Occupy 90% of the screen width
    backgroundColor: '#FFFFFF', // White background for the card
    borderRadius: 20, // Rounded corners for the card
    padding: 20,
    marginTop: 15, // Space from the very top of the screen
    alignItems: 'center', // Center items inside the card
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start', // Align text to the left
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E89FF", // Black color for "HOME"
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#2E89FF", // Greyish color for subtitle
    textAlign: "left",
    marginBottom: 0, // No bottom margin, it's handled by header's marginBottom
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around", // Distribute items evenly
    width: "100%", // Take full width of the card
    marginVertical: 20,
  },
  statBox: {
    width: 100,
    height: 80,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 0, // Remove horizontal margin, let space-around handle it
    shadowColor: "#000", // Add shadow for depth
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#333", // Darker text for labels
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#000000",
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 23,
    marginHorizontal: 5, //  Margin between buttons
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  actionText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: 'bold',
  },
  calendarBox: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: "#2E89FF", 
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    elevation: 5,
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#2E89FF",
    bottom: 0, // At the bottom
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'center',
    width: "100%",
    height: 70,
    paddingBottom: 10,
  },
});