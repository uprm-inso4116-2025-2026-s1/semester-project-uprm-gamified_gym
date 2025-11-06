import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from "../../lib/supabaseClient";

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Login: undefined;
};

export default function Settings() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    weight: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSwitch = () => setIsEnabled((prev) => !prev);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_profiles_test")
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

  async function saveProfile() {
    if (!profile.first_name.trim() || !profile.last_name.trim() || !profile.weight.trim()) {
    Alert.alert("Error", "Fields cannot be empty!");
    return;
  }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        weight: profile.weight,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("user_profiles_test")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated!");
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Error updating profile", error.message);
    } finally {
      setLoading(false);
    }
  }

  const renderField = (label: string, fieldKey: keyof typeof profile, keyboardType: any = "default") => {
    const isEmail = fieldKey === "email";
    return (
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={profile[fieldKey]}
          editable={isEditing && !isEmail}
          keyboardType={keyboardType}
          onChangeText={(val) => setProfile({ ...profile, [fieldKey]: val })}
          style={[
            styles.input,
            isEmail ? { backgroundColor: "#e5e7eb", color: "#6b7280" } : {},
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <View style={styles.settingCard}>
        <Text style={styles.title}>Account Settings</Text>

        {renderField("First Name:", "first_name")}
        {renderField("Last Name:", "last_name")}
        {renderField("Email:", "email")}
        {renderField("Weight lb:", "weight", "numeric")}

        {!isEditing ? (
          <TouchableOpacity style={styles.Buttons} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <TouchableOpacity
              style={[styles.Buttons, { flex: 1, marginRight: 5 }]}
              onPress={saveProfile}
            >
              <Text style={styles.buttonText}>{loading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.Buttons, { flex: 1, marginLeft: 5, backgroundColor: "#ccc" }]}
              onPress={() => {
                fetchProfile(); // reset fields
                setIsEditing(false);
              }}
            >
              <Text style={[styles.buttonText, { color: "#000" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.normalText, { alignSelf: "flex-start", marginBottom: 5 }]}>Preferences</Text>

        <View style={styles.toggleRow}>
          <Text style={[styles.normalText, { alignSelf: "center", marginBottom: 0 }]}>
            PUSH NOTIFICATIONS
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#2E89FF" }}
            thumbColor={isEnabled ? "#000000" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        <TouchableOpacity
          style={[styles.Buttons, { bottom: -35, backgroundColor: "#FF9395" }]}
          onPress={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
              Alert.alert("Logged out");
            }
          }}
        >
          <Text style={[styles.buttonText, { color: "#FE5757" }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  background: {
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#2E89FF",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 50,
    paddingBottom: 34,
    paddingHorizontal: 42,
    paddingTop: 25,
  },
  navIcon: { width: 29, height: 29, resizeMode: "contain" },
  Buttons: {
    backgroundColor: "#2E89FF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#000000", fontSize: 16, fontWeight: "500" },
  title: { fontSize: 50, fontWeight: "600", color: "#2E89FF", marginTop: -10, marginBottom: 20 },
  normalText: { fontSize: 18, color: "#2E89FF", marginBottom: 10 },
  settingCard: {
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
    marginVertical: 5,
    fontSize: 16,
    width: "100%",
  },
});
// Replace the placeholder with a proper React state hook for editing mode.
// Put this inside the Settings component along with the other useState calls:
const [isEditing, setIsEditing] = useState<boolean>(false);

