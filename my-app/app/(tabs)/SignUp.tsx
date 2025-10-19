import React, { useState } from "react";
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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Signup: undefined;
  Password: undefined;
  Login: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Signup">;

interface SigupProps {
  navigation: SignupScreenNavigationProp;
}

export default function Signup({ navigation }: SigupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const onSignup = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (pwd.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (pwd !== confirmPwd) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // TODO: integrar auth real (Firebase / API)
    console.log("Signup attempt:", { name, email, pwd });
    
    // For demo purposes, navigate to Login
    // In real app, you'd call your auth service here
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LOGO{"\n"}HERE</Text>
            </View>

            {/* Títulos */}
            <Text style={styles.title}>Sign up!</Text>
            <Text style={styles.subtitle}>Create an account</Text>

            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Full Name"
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

            {/* Confirm password */}
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirmPwd}     
              onChangeText={setConfirmPwd}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.9)"
              style={styles.input}
            />

            {/* Botón Sign Up */}
            <Pressable onPress={onSignup} style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
            ]}>
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            </Pressable>

            {/* Link a Log in */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.linkUnderline}
                  onPress={() => navigation.navigate("Login")}
                >Log in
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
  screen: {
    flex: 1,
    backgroundColor: BLUE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
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
  inlineRight: {
    width: "100%",
    maxWidth: 440,
    alignItems: "flex-end",
    marginBottom: 6,
  },
  linkInline: {
    color: BLUE,
    fontWeight: "700",
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
  footerText: {
    color: BLUE,
    fontWeight: "700",
    textAlign: "center",
  },
  linkUnderline: {
    color: BLUE,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
