import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabaseClient";
import { checkUsernameAvailable } from "../../utils/checkUsername";

// Password validation helper
function validatePassword(pwd: string) {
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

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
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const status = await checkUsernameAvailable(username.trim());
      setUsernameStatus(status);
      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  async function onSignup() {
    setLoading(true);
    const cleanedUsername = username.trim();
    const passwordCheck = validatePassword(pwd);

    // Validations
    if (!cleanedUsername) {
      Alert.alert("Error", "Please enter a username");
      setLoading(false);
      return;
    }

    if (!usernameStatus.available) {
      Alert.alert("Error", usernameStatus.message || "Username is not available");
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
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
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

      // Create auth user
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
      const { error: profileError } = await supabase.from("user_profiles_test").insert({
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
            "Your account was created, but there was an issue setting up your profile."
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#2E89FF", "#1E5FCC"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="barbell" size={48} color="#fff" />
              </View>
              <Text style={styles.appName}>Gamified Gym</Text>
              <Text style={styles.tagline}>Start your fitness journey</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              {/* Username Input */}
              <View
                style={[
                  styles.inputContainer,
                  username && !usernameStatus.available && usernameStatus.message
                    ? styles.inputError
                    : username && usernameStatus.available
                    ? styles.inputSuccess
                    : {},
                ]}
              >
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholder="Username"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                {checkingUsername ? (
                  <ActivityIndicator size="small" color="#666" style={styles.statusIcon} />
                ) : username && usernameStatus.available ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.statusIcon} />
                ) : username && usernameStatus.message ? (
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" style={styles.statusIcon} />
                ) : null}
              </View>
              {username && usernameStatus.message ? (
                <Text
                  style={[
                    styles.statusText,
                    { color: usernameStatus.available ? "#4CAF50" : "#FF6B6B" },
                  ]}
                >
                  {usernameStatus.message}
                </Text>
              ) : null}

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={pwd}
                  onChangeText={setPwd}
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              {pwd.length > 0 && (
                <View style={styles.passwordHelper}>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordState.hasMinLength ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordState.hasMinLength ? "#4CAF50" : "#E0E0E0"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordState.hasMinLength && styles.requirementMet,
                      ]}
                    >
                      8+ characters
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordState.hasUpper ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordState.hasUpper ? "#4CAF50" : "#E0E0E0"}
                    />
                    <Text
                      style={[styles.requirementText, passwordState.hasUpper && styles.requirementMet]}
                    >
                      Uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordState.hasLower ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordState.hasLower ? "#4CAF50" : "#E0E0E0"}
                    />
                    <Text
                      style={[styles.requirementText, passwordState.hasLower && styles.requirementMet]}
                    >
                      Lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordState.hasNumber ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordState.hasNumber ? "#4CAF50" : "#E0E0E0"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordState.hasNumber && styles.requirementMet,
                      ]}
                    >
                      Number
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Ionicons
                      name={passwordState.hasSpecial ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordState.hasSpecial ? "#4CAF50" : "#E0E0E0"}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        passwordState.hasSpecial && styles.requirementMet,
                      ]}
                    >
                      Special character
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={onSignup}
                disabled={loading}
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ["#999", "#777"] : ["#2E89FF", "#1E5FCC"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/Login")}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Success Popup */}
        {showSuccessPopup && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
              </View>
              <Text style={styles.popupTitle}>Account Created!</Text>
              <Text style={styles.popupMessage}>
                Welcome aboard! Redirecting you to login...
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  inputSuccess: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  statusIcon: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  passwordHelper: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#999",
  },
  requirementMet: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  signupButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 15,
    color: "#666",
  },
  loginLink: {
    fontSize: 15,
    color: "#2E89FF",
    fontWeight: "700",
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popupCard: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
  },
  popupMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
