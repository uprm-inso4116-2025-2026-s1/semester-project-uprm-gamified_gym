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
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // Add filter state

  const filterOptions = ["All", "Strength", "Cardio", "Flexibility"]; // Example filters

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.headerBar}>
              <Text style={styles.headerText}>Add Workout</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises"
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {/* End Search Bar */}

            {/* Filter Buttons */}
            <View style={styles.filterRow}>
              {filterOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterBtn,
                    selectedFilter === option && styles.filterBtnActive
                  ]}
                  onPress={() => setSelectedFilter(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === option && styles.filterTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* End Filter Buttons */}

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
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  filterBtn: {
    backgroundColor: "#EEE",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterBtnActive: {
    backgroundColor: "#2C82FF",
  },
  filterText: {
    color: "#555",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    margin: 14,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
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