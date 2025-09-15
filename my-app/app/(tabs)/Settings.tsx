import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Page</Text>
      <Text>Welcome to the Settings screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // make sure background is visible
  },
  title: {
    fontSize: 24,
    color: "teal",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "black",
  },
});