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
  ActivityIndicator,
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
      <View style={styles.fieldContainer}>
        <Text style={styles.labelText}>{label}</Text>
        <TextInput
          value={userProfile[fieldKey]}
          editable={isEditingProfile && !isEmail}
          keyboardType={keyboardType}
          onChangeText={(val) => setUserProfile({ ...userProfile, [fieldKey]: val })}
          style={[
            styles.input,
            isEmail && styles.disabledInput,
            isEditingProfile && !isEmail && styles.inputEditing,
          ]}
          placeholderTextColor="#9CA3AF"
        />
        {isEmail && (
          <Text style={styles.helperText}>Email cannot be changed</Text>
        )}
      </View>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderDivider = () => <View style={styles.divider} />;

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert("Success", "Logged out successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to log out");
    }
  };

  const handleCancelEdit = () => {
    loadUserProfile();
    setIsEditingProfile(false);
  };

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.settingCard}>
            <Text style={styles.title}>Settings</Text>

            {isLoadingProfileData && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#2E89FF" />
              </View>
            )}

            {renderSectionHeader("Account Information")}

            {renderField("First Name", "first_name")}
            {renderField("Last Name", "last_name")}
            {renderField("Email", "email")}
            {renderField("Weight (lbs)", "weight", "numeric")}

            {!isEditingProfile ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingProfile(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={updateUserProfileDetails}
                  disabled={isLoadingProfileData}
                  activeOpacity={0.7}
                >
                  {isLoadingProfileData ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isLoadingProfileData}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {renderDivider()}

            {renderSectionHeader("Preferences")}

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceTitle}>Push Notifications</Text>
                <Text style={styles.preferenceDescription}>
                  Receive updates about your fitness goals
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={pushNotificationsEnabled ? "#2E89FF" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={togglePushNotifications}
                value={pushNotificationsEnabled}
              />
            </View>

            {renderDivider()}

            {renderSectionHeader("Account Actions")}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.7}>
          <Image source={require("../../assets/images/home.png")} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ExerciseLibrary")} activeOpacity={0.7}>
          <Image source={require("../../assets/images/push-up.png")} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.7}>
          <Image source={require("../../assets/images/user.png")} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} activeOpacity={0.7}>
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
    alignItems: "center",
    justifyContent: "flex-start",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 120,
  },
  settingCard: {
    width: "92%",
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderRadius: 20,
  },
  sectionHeader: {
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E89FF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    width: "100%",
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  inputEditing: {
    borderColor: "#2E89FF",
    borderWidth: 2,
    backgroundColor: "#F0F9FF",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  editButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2E89FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  editButtonText: {
    color: "#2E89FF",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2E89FF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  preferenceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#FCA5A5",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
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
    tintColor: "#000000",
  },
});
