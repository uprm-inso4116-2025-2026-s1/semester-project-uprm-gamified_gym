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
import { supabase } from "../../lib/supabaseClient";
import {checkUsernameAvailable} from "../../utils/checkUsername"; 
import { useRouter } from "expo-router";



export default function Signup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string }>({
    available: false,
    message: "",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);

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

    // --- VALIDATIONS ---
    if (!cleanedUsername) {
      Alert.alert("Error", "Please enter a username");
      setLoading(false);
      return;
    }

    if (!usernameStatus.available) {
      Alert.alert("Error", usernameStatus.message);
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

    if (pwd.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (pwd !== confirmPwd) {
      Alert.alert("Error", "Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // --- SPLIT FULL NAME ---
      const [firstName, ...lastNameParts] = name.trim().split(" ");
      const lastName = lastNameParts.join(" ") || null;

      // --- CREATE SUPABASE AUTH ---
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

      // --- INSERT INTO user_profiles ---
      const { error: profileError } = await supabase
        .from("user_profiles_test")
        .insert({
          id: userId,
          username: cleanedUsername,
          first_name: firstName,
          last_name: lastName,
        });

      if (profileError) {
        Alert.alert(
          "Profile Error",
          `Account created, but profile failed: ${profileError.message}`
        );
      } else {
        Alert.alert("Success!", "Your account has been created.");
        router.push("/(tabs)/Login");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

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
                usernameStatus.available === false && username ? { borderColor: "red", borderWidth: 1 } : {},
              ]}
            />
            {username ? (
              <Text style={{ color: usernameStatus.available ? "green" : "red", marginBottom: 6 }}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const BLUE = "#2F80FF";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" },
  card: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  logoBox: { width: 140, height: 90, borderRadius: 18, backgroundColor: BLUE, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  logoText: { color: "#fff", fontWeight: "700", textAlign: "center", letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "900", color: BLUE, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: BLUE, opacity: 0.9, textAlign: "center", marginBottom: 10 },
  label: { alignSelf: "flex-start", width: "100%", maxWidth: 440, color: BLUE, fontWeight: "700", marginBottom: 6 },
  input: { width: "100%", maxWidth: 440, height: 44, borderRadius: 12, paddingHorizontal: 14, backgroundColor: "rgba(114,167,255,0.85)", color: "#fff", fontWeight: "600", marginBottom: 8 },
  primaryBtn: { width: "100%", maxWidth: 440, height: 50, borderRadius: 16, backgroundColor: BLUE, justifyContent: "center", alignItems: "center", marginTop: 6 },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  footerText: { color: BLUE, fontWeight: "700", textAlign: "center" },
  linkUnderline: { color: BLUE, fontWeight: "800", textDecorationLine: "underline" },
});
