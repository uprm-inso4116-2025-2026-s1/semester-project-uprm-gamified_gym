import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabaseClient";
import { checkUsernameAvailable } from "../../utils/checkUsername";

// --- Password validation helper ---
function validatePassword(pwd: string) {
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const isValid =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    isValid,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

export default function SignUp() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    message: string;
  }>({
    available: false,
    message: "",
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Clear passwords on mount
  useEffect(() => {
    setPwd("");
    setConfirmPwd("");
  }, []);

  // Real-time username check (debounced)
  useEffect(() => {
    if (!username) {
      setUsernameStatus({ available: false, message: "" });
      return;
    }

    const timer = setTimeout(async () => {
      const status = await checkUsernameAvailable(username.trim());
      setUsernameStatus(status);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  async function onSignup() {
    setLoading(true);
    const cleanedUsername = username.trim();
    const passwordCheck = validatePassword(pwd);

    // --- VALIDATIONS ---
    if (!cleanedUsername) {
      Alert.alert("Error", "Please enter a username");
      setLoading(false);
      return;
    }

    if (!usernameStatus.available) {
      Alert.alert(
        "Error",
        usernameStatus.message || "Username is not available"
      );
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!passwordCheck.isValid) {
      Alert.alert(
        "Weak password",
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
      );
      setLoading(false);
      return;
    }

    if (pwd !== confirmPwd) {
      Alert.alert("Error", "Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Split full name
      const [firstName, ...lastNameParts] = name.trim().split(" ");
      const lastName = lastNameParts.join(" ") || null;

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pwd,
      });

      if (authError) {
        Alert.alert("Signup Error", authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        Alert.alert("Error", "Failed to create user.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Insert profile
      const { error: profileError } = await supabase
        .from("user_profiles_test")
        .insert({
          id: userId,
          username: cleanedUsername,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) {
        const msg = profileError.message || "";
        if (
          msg.includes("duplicate key value violates unique constraint") &&
          msg.toLowerCase().includes("username")
        ) {
          Alert.alert(
            "Username Taken",
            "This username was just taken. Please choose a different one."
          );
        } else {
          Alert.alert(
            "Profile Error",
            "Your account was created, but there was an issue setting up your profile. Please try again."
          );
        }
      } else {
        // Show success popup and redirect
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          router.push("/(tabs)/Login");
        }, 2200);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const passwordState = validatePassword(pwd);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LOGO{"\n"}HERE</Text>
            </View>

            <Text style={styles.title}>Sign up!</Text>
            <Text style={styles.subtitle}>Create an account</Text>

            {/* Username */}
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Choose a username"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={[
                styles.input,
                usernameStatus.available === false &&
                  username &&
                  usernameStatus.message
                  ? { borderColor: ERROR_RED, borderWidth: 1 }
                  : {},
              ]}
            />
            {username ? (
              <Text
                style={{
                  color: usernameStatus.available
                    ? SUCCESS_GREEN
                    : ERROR_RED,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                {usernameStatus.message}
              </Text>
            ) : null}

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={pwd}
              onChangeText={setPwd}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            {/* Password Requirements (always visible) */}
            <View style={styles.passwordHelper}>
              <Text
                style={[
                  styles.requirementText,
                  passwordState.hasMinLength && styles.requirementMet,
                ]}
              >
                {passwordState.hasMinLength ? "•" : "○"} At least 8 characters
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  passwordState.hasUpper && styles.requirementMet,
                ]}
              >
                {passwordState.hasUpper ? "•" : "○"} One uppercase letter
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  passwordState.hasLower && styles.requirementMet,
                ]}
              >
                {passwordState.hasLower ? "•" : "○"} One lowercase letter
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  passwordState.hasNumber && styles.requirementMet,
                ]}
              >
                {passwordState.hasNumber ? "•" : "○"} One number
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  passwordState.hasSpecial && styles.requirementMet,
                ]}
              >
                {passwordState.hasSpecial ? "•" : "○"} One special character
              </Text>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            <Pressable
              onPress={onSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || loading) && { opacity: 0.9 },
                loading && { backgroundColor: "#aaa" },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </Pressable>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.linkUnderline}
                  onPress={() => router.push("/(tabs)/Login")}
                >
                  Log in
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Success Popup */}
        {showSuccessPopup && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <Ionicons
                name="checkmark-circle"
                size={40}
                color={BLUE}
                style={styles.popupIcon}
              />
              <Text style={styles.popupTitle}>Account Created</Text>
              <Text style={styles.popupMessage}>
                You’re all set! Redirecting you to login...
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const BLUE = "#2F80FF";
const ERROR_RED = "#FF4D4F";
const SUCCESS_GREEN = "#27AE60";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  logoBox: {
    width: 140,
    height: 90,
    borderRadius: 18,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: BLUE,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: BLUE,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 440,
    color: BLUE,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    maxWidth: 440,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(114,167,255,0.85)",
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
  },
  primaryBtn: {
    width: "100%",
    maxWidth: 440,
    height: 50,
    borderRadius: 16,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  footerText: { color: BLUE, fontWeight: "700", textAlign: "center" },
  linkUnderline: {
    color: BLUE,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  // Password helper
  passwordHelper: {
    width: "100%",
    maxWidth: 440,
    marginTop: 4,
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 11,
    color: ERROR_RED,
  },
  requirementMet: {
    color: SUCCESS_GREEN,
    fontWeight: "700",
  },

  // Success popup
  popupOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  popupCard: {
    width: "78%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 10,
  },
  popupIcon: {
    marginBottom: 6,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BLUE,
    marginBottom: 4,
  },
  popupMessage: {
    fontSize: 13,
    color: "#4F4F4F",
    textAlign: "center",
  },
});
