import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";

export default function Settings() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    weight: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null); // tracks which button is being edited
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: user.email || "",
        weight: data.weight || "",
      });
    } catch (error: any) {
      Alert.alert("Error fetching profile", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveField(field: string) {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = { updated_at: new Date() };

      if (field === "email") {
        // Email is stored in the users table
        const { error } = await supabase.from("users").update({ email: profile.email }).eq("id", user.id);
        if (error) throw error;
      } else {
        updates[field] = profile[field as keyof typeof profile];
        const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id);
        if (error) throw error;
      }

      Alert.alert("Success", `${field} updated!`);
      setEditingField(null);
    } catch (error: any) {
      Alert.alert("Error updating field", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Helper to render either button or TextInput for editable fields
  const renderEditableField = (label: string, fieldKey: string, keyboardType: any = "default") => {
    if (editingField === fieldKey) {
      return (
        <View style={{ width: "100%" }}>
          <TextInput
            style={styles.input}
            value={profile[fieldKey as keyof typeof profile]}
            onChangeText={(text) => setProfile({ ...profile, [fieldKey]: text })}
            keyboardType={keyboardType}
          />
          <TouchableOpacity style={styles.Buttons} onPress={() => saveField(fieldKey)}>
            <Text style={styles.buttonText}>{loading ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.Buttons} onPress={() => setEditingField(fieldKey)}>
        <Text style={styles.buttonText}>
          {label}: {profile[fieldKey as keyof typeof profile]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.background}>
      <View style={styles.settingCard}>
        <Text style={styles.title}>Settings</Text>
        <Text style={[styles.normalText, { alignSelf: "flex-start" }]}>Account</Text>

        {renderEditableField("Name", "first_name")}
        {renderEditableField("Email", "email")}
        {renderEditableField("Weight", "weight", "numeric")}

        <Text style={[styles.normalText, { alignSelf: "flex-start", marginBottom: 10 }]}>Preferences</Text>

        {/* Toggle for push notifications */}
        <View style={styles.toggleRow}>
          <Text style={[styles.normalText, { alignSelf: "center", marginBottom: 0 }]}>PUSH NOTIFICATIONS</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#2E89FF" }}
            thumbColor={isEnabled ? "##000000" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={[styles.Buttons, { bottom: -35, backgroundColor: "#FF9395" }]}
          onPress={async () => {
            await supabase.auth.signOut();
            Alert.alert("Logged out");
          }}
        >
          <Text style={[styles.buttonText, { color: "#FE5757" }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

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
    bottom: 15,
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
    minHeight: 570,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
    width: "100%",
  },
});
