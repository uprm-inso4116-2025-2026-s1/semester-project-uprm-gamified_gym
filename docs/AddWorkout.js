import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BLUE = "#2C82FF";
const CARD_BG = "#FFFFFF";
const LIGHT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export default function AddWorkoutScreen() {
  const [title, setTitle] = useState("");
  const [exCount, setExCount] = useState(0);
  const [setCount, setSetCount] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.headerBar}>
              <Text style={styles.headerText}>Add Workout</Text>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a Title"
              placeholderTextColor="#6B6B6B"
              style={styles.input}
            />

            <Text style={styles.counts}>{exCount} exercises, {setCount} sets</Text>

            <Text style={styles.subTitle}>Add exercises</Text>

            <TouchableOpacity
              style={styles.addPill}
              activeOpacity={0.75} 
              onPress={() => {}}  //to give the add excercise button functionality
            >
              <View style={styles.plusIcon}>
                <Ionicons name="add" size={18} />
              </View>
              <Text style={styles.addPillText}>Add exercises</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.saveWrap}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={() => {}}>
            <Text style={styles.saveText}>Save Workout</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    ...LIGHT_SHADOW,
    paddingBottom: 16,
    overflow: "hidden",
  },
  headerBar: {
    backgroundColor: "#E6E6E6",
    paddingVertical: 10,
    alignItems: "center",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  headerText: { fontWeight: "600", color: "#1A1A1A" },

  input: {
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },

  counts: { marginTop: 10, marginHorizontal: 16, color: "#333" },
  subTitle: { marginTop: 16, marginHorizontal: 16, fontWeight: "700", color: "#222" },

  addPill: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10, 
  },
  plusIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#FFF", alignItems: "center", justifyContent: "center",
    marginRight: 10,
  },
  addPillText: { fontWeight: "700", color: "#1F1F1F" },

  saveWrap: { position: "absolute", left: 0, right: 0, bottom: 80, alignItems: "center" },
  saveBtn: { backgroundColor: BLUE, paddingHorizontal: 26, paddingVertical: 12, borderRadius: 24, ...LIGHT_SHADOW },
  saveText: { color: "#FFF", fontWeight: "600" },
});
