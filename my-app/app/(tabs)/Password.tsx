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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./index";
import { supabase } from "../../lib/supabaseClient";

type PasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Password"
>;

export default function Password() {
  const navigation = useNavigation<PasswordScreenNavigationProp>();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Password screen mounted");
  }, []);

  const onSubmit = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/resetPassword",
      });

      setLoading(false);

      if (resetError) {
        Alert.alert("Error", resetError.message);
      } else {
        Alert.alert(
          "Email Sent",
          "If an account with that email exists, you will receive a link to reset your password."
        );
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LOGO{"\n"}HERE</Text>
            </View>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Please enter the email address you&apos;d like your {"\n"}
              password reset information sent to
            </Text>

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

            <Pressable
              onPress={onSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Sending..." : "Reset Password"}
              </Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.backLink}>Back to Log In</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BLUE = "#2F80FF";

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
    marginBottom: 18,
  },
  logoText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: BLUE,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: BLUE,
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  label: {
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 440,
    color: BLUE,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
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
    marginBottom: 18,
  },
  primaryBtn: {
    width: "100%",
    maxWidth: 440,
    height: 48,
    borderRadius: 16,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  backLink: {
    color: BLUE,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
