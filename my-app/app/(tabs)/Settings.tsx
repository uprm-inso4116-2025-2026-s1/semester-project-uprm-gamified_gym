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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "./authContext";

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Login: undefined;
  ExerciseLog: undefined;
  ExerciseLibrary: undefined;
};

/**
 * Settings screen component for managing user account details and preferences.
 * 
 * Provides functionality to:
 *  - View and edit profile information (first name, last name, email, weight)
 *  - Enable or disable push notifications
 *  - Log out of the application
 * 
 * This component communicates with Supabase for user data retrieval and updates.
 */
export default function Settings() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { signOut } = useAuth();

  const [userProfile, setUserProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    weight: "",
  });
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  /**
 * Toggles whether the user receives push notifications for fitness goals and progress updates.
 */
  const togglePushNotifications = () => setPushNotificationsEnabled((previousState) => !previousState);

  // Automatically loads the user's profile data when the screen mounts.
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
 * Loads the currently authenticated user's profile data from Supabase.
 * Populates the userProfile state with first name, last name, email, and weight.
 */
  async function loadUserProfile() {
    setIsLoadingProfileData(true);
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

      setUserProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: user.email || "",
        weight: data.weight ? String(data.weight) : "",
      });
    } catch (error: any) {
      Alert.alert("Error loading profile", error.message);
    } finally {
      setIsLoadingProfileData(false);
    }
  }

  /**
 * Persists updated profile details to Supabase.
 * Shows a success alert and exits edit mode upon completion.
 */
  async function updateUserProfileDetails() {
    if (!userProfile.first_name.trim() || !userProfile.last_name.trim() || !String(userProfile.weight).trim()) {
      Alert.alert("Error", "Fields cannot be empty!");
      return;
    }
    setIsLoadingProfileData(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        weight: userProfile.weight,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("user_profiles_test")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated!");
      setIsEditingProfile(false);
    } catch (error: any) {
      Alert.alert("Error updating profile", error.message);
    } finally {
      setIsLoadingProfileData(false);
    }
  }

  /**
 * Renders a labeled text input field for a given profile attribute.
 *
 * @param label - The descriptive label for the input (e.g., "First Name").
 * @param fieldKey - The key of the userProfile object this input controls.
 * @param keyboardType - The keyboard type (default is "default"; use "numeric" for number fields).
 *
 * Fields like email are displayed but not editable.
 */
  const renderField = (label: string, fieldKey: keyof typeof userProfile, keyboardType: any = "default") => {
    const isEmail = fieldKey === "email";
    return (
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Text style={styles.labelText}>{label}</Text>
        <TextInput
          value={userProfile[fieldKey]}
          editable={isEditingProfile && !isEmail}
          keyboardType={keyboardType}
          onChangeText={(val) => setUserProfile({ ...userProfile, [fieldKey]: val })}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%", alignItems: "center" }}
      >
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.settingCard}>
            <Text style={styles.title}>Account Settings</Text>

            {renderField("First Name:", "first_name")}
            {renderField("Last Name:", "last_name")}
            {renderField("Email:", "email")}
            {renderField("Weight lb:", "weight", "numeric")}

            {!isEditingProfile ? (
              <TouchableOpacity style={styles.Buttons} onPress={() => setIsEditingProfile(true)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}
              >
                <TouchableOpacity
                  style={[styles.Buttons, { flex: 1, marginRight: 5 }]}
                  onPress={updateUserProfileDetails}
                >
                  <Text style={styles.buttonText}>{isLoadingProfileData ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.Buttons, { flex: 1, marginLeft: 5, backgroundColor: "#ccc" }]}
                  onPress={() => {
                    loadUserProfile();
                    setIsEditingProfile(false);
                  }}
                >
                  <Text style={[styles.buttonText, { color: "#000" }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text
              style={[styles.toggleText, { alignSelf: "flex-start", marginBottom: 5, marginTop: 10 }]}
            >
              Preferences
            </Text>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleText, { alignSelf: "center", marginBottom: 0 }]}>
                PUSH NOTIFICATIONS
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#2E89FF" }}
                thumbColor={pushNotificationsEnabled ? "#000000" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={togglePushNotifications}
                value={pushNotificationsEnabled}
              />
            </View>

            /**
            * Logs the current user out of the session via Supabase and navigates back to the Login screen.
            * Displays an alert upon success or failure.
            */
            <TouchableOpacity
              style={[styles.Buttons, { marginTop: 30, backgroundColor: "#FF9395" }]}
              onPress={async () => {
                try {
                  await signOut();
                  Alert.alert("Success", "Logged out successfully");
                  // AuthNavigator will handle redirect to Login
                } catch (error: any) {
                  Alert.alert("Error", error.message || "Failed to log out");
                }
              }}
            >
              <Text style={[styles.buttonText, { color: "#FE5757" }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      /**
      * Navigation shortcuts for primary sections of the app:
      * Home, Profile, and Settings.
      *
      * Each button redirects to its respective screen in the stack.
      */
      <View style={styles.bottomTabs}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image source={require("../../assets/images/home.png")} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ExerciseLibrary")}>
          <Image source={require("../../assets/images/push-up.png")} style={styles.navIcon} />
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
  labelText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  background: {
    flex: 1,
    backgroundColor: "#2E89FF",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  settingCard: {
    width: "92%",
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#2E89FF",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginVertical: 5,
    fontSize: 15,
    width: "100%",
  },
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
  toggleText: { fontSize: 15, color: "#2E89FF", marginBottom: 10 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 32,
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#ffffff",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 35,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    paddingHorizontal: 30,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#000000ff",
  },
});
