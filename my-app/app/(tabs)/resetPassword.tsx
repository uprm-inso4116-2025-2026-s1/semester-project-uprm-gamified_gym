import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPassword() {
  const router = useRouter();
  useLocalSearchParams(); 
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleRecovery = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) console.error("Session error:", error.message);

      setReady(true);
      setLoading(false);
    };

    handleRecovery();
  }, []);

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Your password has been updated!");
      router.replace("/(tabs)/Login");
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#2F80FF" }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white" }}>Loading reset link...</Text>
      </View>
    );

  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#2F80FF" }}>
        <Text style={{ color: "white" }}>No valid reset session detected.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#2F80FF", padding: 20 }}>
      {/* White card container */}
      <View style={{
        width: "100%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#2F80FF" }}>
          Reset Your Password
        </Text>

        <TextInput
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#aaa",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
          }}
        />

        <Pressable
          onPress={handlePasswordUpdate}
          disabled={loading}
          style={{
            backgroundColor: "#2F80FF",
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {loading ? "Updating..." : "Update Password"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
