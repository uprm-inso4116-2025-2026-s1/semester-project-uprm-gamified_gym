import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator, // Loading
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabaseClient";

type RootStackParamList = {
  Login: undefined;
  Password: undefined;
  SignUp: undefined;
  Home: undefined; // Go to after login
};
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function Login() {
  // Hook
  const navigation = useNavigation<LoginScreenNavigationProp>(); 
  
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState("");

  const onLogin = async () => {
    if (!email.trim() || !pwd) {
      setError("Please enter EMAIL and PASSWORD");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Authenticate w/Supabase
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pwd,
      });

      if (authError) {
        setError(authError.message);
        console.error('Supabase Auth Error:', authError.message);
      } else if (user) {
        console.log("Login Successful! User:", user.id);
        navigation.navigate("Home"); 
      }
    } catch (e) {
      console.error("Login attempt failed:", e);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Logo y Títulos */}
            <View style={styles.logoBox}><Text style={styles.logoText}>LOGO{"\n"}HERE</Text></View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>

            {/* Error Message */}
            {error ? (
              <Text style={styles.errorText}>
                {error}
              </Text>
            ) : null}

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
            <Text style={[styles.label, { marginTop: 10 }]}>Password</Text>
            <TextInput
              value={pwd}
              onChangeText={setPwd}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            {/* Forgot Password (derecha) */}
            <View style={styles.inlineRight}>
              <Pressable onPress={() => navigation.navigate("Password")}>
                <Text style={styles.linkInline}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Butón Log In */}
            <Pressable 
              onPress={onLogin} 
              disabled={loading} 
              style={({ pressed }) => [
                styles.primaryBtn,
                loading ? styles.primaryBtnDisabled : (pressed && { opacity: 0.9 }),
            ]}
            >
              {/* Show Spinner or Text */}
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </Pressable>

            {/* Link a Sign Up */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.footerText}>
                Don’t have an account?{" "}
                <Text
                  style={styles.linkUnderline}
                  onPress={() => navigation.navigate("SignUp")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BLUE = "#2F80FF";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" },
  card: {
    width: "92%",
    backgroundColor: "#FFFFFF",
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
  logoBox: {
    width: 140, height: 90, borderRadius: 18, backgroundColor: BLUE,
    justifyContent: "center", alignItems: "center", marginBottom: 18,
  },
  logoText: { color: "#fff", fontWeight: "700", textAlign: "center", letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: "900", color: BLUE, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: BLUE, opacity: 0.9, textAlign: "center", marginBottom: 18 },
  label: {
    alignSelf: "flex-start", width: "100%", maxWidth: 440,
    color: BLUE, fontWeight: "700", marginBottom: 6,
  },
  input: {
    width: "100%", maxWidth: 440, height: 44, borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: "rgba(114,167,255,0.85)", color: "#fff", fontWeight: "600", marginBottom: 8,
  },
  inlineRight: { width: "100%", maxWidth: 440, alignItems: "flex-end", marginBottom: 6 },
  linkInline: { color: BLUE, fontWeight: "700" },
  primaryBtn: {
    width: "100%", maxWidth: 440, height: 50, borderRadius: 16, backgroundColor: BLUE,
    justifyContent: "center", alignItems: "center", marginTop: 6,
  },
  // New Style Def
  primaryBtnDisabled: { 
    opacity: 0.6, 
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  footerText: { color: BLUE, fontWeight: "700", textAlign: "center" },
  linkUnderline: { color: BLUE, fontWeight: "800", textDecorationLine: "underline" },
  // New Style Def
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  }
});