import React, {useState} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function Settings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    // blue background
    <View style={styles.background}>

      {/* Inner white card */}
      <View style={styles.settingCard}>
        <Text style={styles.title}>Settings</Text>
        <Text style={[styles.normalText, {alignSelf: "flex-start"}]}>Account</Text>

        {/* Buttons */}
        <TouchableOpacity style={styles.Buttons}>
          <Text style={styles.buttonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Buttons}>
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Buttons}>
          <Text style={styles.buttonText}>Weight</Text>
        </TouchableOpacity>

        <Text style={[styles.normalText, {alignSelf: "flex-start", marginBottom: 10}]}>Preferences</Text>

        {/* Toggle for push notifications */}
        <View style={styles.toggleRow}>
          <Text style={[styles.normalText, {alignSelf: "center", marginBottom: 0}]}>PUSH NOTIFICATIONS</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#2E89FF" }}
            thumbColor={isEnabled ? "##000000" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        {/* Logout button */}
        <TouchableOpacity style={[styles.Buttons, {bottom: -35, backgroundColor: "#FF9395"}]}>
          <Text style={[styles.buttonText, {color: "#FE5757"}]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom navigation bar outside card*/}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={32} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={32} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings" size={32} color="#000000" />
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2E89FF",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2E89FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "90%",
    position: "absolute",
    bottom: 15, //move the navbar up or down
  },
  Buttons: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 50,
    color: "#2E89FF",
    marginTop: -20,
    marginBottom: 20,
  },
  normalText: {
    fontSize: 18,
    color: "#2E89FF",
    marginBottom: 10,
  },
  settingCard: {
    marginTop: -20,
    marginBottom: 0,
    backgroundColor: "##000000",
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
    minHeight: 570,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
});