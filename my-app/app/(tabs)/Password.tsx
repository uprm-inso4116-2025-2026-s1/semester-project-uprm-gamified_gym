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
} from "react-native";

import type { NavigationProp } from "@react-navigation/native";

export default function Password({ navigation }: { navigation: NavigationProp<any> }) {
  const [email, setEmail] = useState("");

  const onSubmit = () => {
    // Aquí luego conectas con tu flujo (API / Firebase / etc.)
    // Por ahora solo valida sencillo:
    if (!email.includes("@")) return;
    // TODO: trigger password reset
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Card blanca */}
          <View style={styles.card}>
            {/* Logo placeholder redondeado */}
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LOGO{"\n"}HERE</Text>
            </View>

            {/* Título / subtítulo */}
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Please enter the email address you&apos;d like your {"\n"}
              password reset information sent to
            </Text>

            {/* Label + input */}
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

            {/* Botón principal */}
            <Pressable onPress={onSubmit} style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
            ]}>
              <Text style={styles.primaryBtnText}>Reset Password</Text>
            </Pressable>

            {/* Link back */}
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
  screen: {
    flex: 1,
    backgroundColor: BLUE, // fondo azul de la pantalla
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
    // sombra
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
    // input azul claro como en la imagen
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
