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
import { supabase } from "../../lib/supabaseClient";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export default function Settings() {
  const navigation = useNavigation<any>();

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = { updated_at: new Date() };

      if (field === "email") {
        const { error } = await supabase
          .from("users")
          .update({ email: profile.email })
          .eq("id", user.id);
        if (error) throw error;
      } else {
        updates[field] = profile[field as keyof typeof profile];
        const { error } = await supabase
          .from("user_profiles")
          .update(updates)
          .eq("id", user.id);
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

  const renderEditableField = (
    label: string,
    fieldKey: string,
    keyboardType: any = "default"
  ) => {
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

        <Text style={[styles.normalText, { alignSelf: "flex-start", marginBottom: 10 }]}>
          Preferences
        </Text>

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
            await supabase.auth.signOut();
            Alert.alert("Logged out");
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
    paddingHorizontal: 52,
    paddingTop: 25,
  },
  navIcon: { width: 29, height: 29, resizeMode: "contain" },
  Buttons: {
    backgroundColor: "#2E89FF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
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
    marginVertical: 10,
    fontSize: 16,
    width: "100%",
  },
});
