import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../lib/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const predefinedMealGroups = ["Breakfast", "Lunch", "Dinner", "Snack"];
const SCREEN_WIDTH = Math.min(Dimensions.get("window").width, 600);

interface MealSet {
  protein: string;
  calories: string;
}

interface MealEntry {
  name: string;
  meals: MealSet[];
  notes?: string;
  mealGroup?: string;
}

const COLORS = {
  blue: "#2F80FF",
  green: "#28a745",
  red: "#a43535ff",
  gray: "#888",
};

export default function MealEntryCard() {
  const [mealTitle, setMealTitle] = React.useState("My Meals");
  const [mealList, setMealList] = React.useState<MealEntry[]>([
    { name: "Chicken & Rice", meals: [{ protein: "", calories: "" }] },
  ]);

  /** Add new meal block */
  function addNewMeal() {
    setMealList((prev) => [
      ...prev,
      { name: "", meals: [{ protein: "", calories: "" }] },
    ]);
  }

  /** Update meal name */
  function updateMealName(index: number, newName: string) {
    const updated = [...mealList];
    updated[index].name = newName;
    setMealList(updated);
  }

  /** Update notes */
  function updateMealNotes(index: number, newNotes: string) {
    const updated = [...mealList];
    updated[index].notes = newNotes;
    setMealList(updated);
  }

  /** Add set */
  function addSetToMeal(mealIndex: number) {
    const updated = [...mealList];
    updated[mealIndex].meals.push({ protein: "", calories: "" });
    setMealList(updated);
  }

  /** Update a set value */
  function updateSetValue(
    mealIndex: number,
    setIndex: number,
    field: "protein" | "calories",
    value: string
  ) {
    const updated = [...mealList];
    updated[mealIndex].meals[setIndex][field] = value.replace(/[^0-9.]/g, "");
    setMealList(updated);
  }

  /** Remove set */
  function removeSet(mealIndex: number, setIndex: number) {
    const updated = [...mealList];
    updated[mealIndex].meals.splice(setIndex, 1);
    setMealList(updated);
  }

  /** Remove entire meal card */
  function removeMeal(mealIndex: number) {
    const updated = [...mealList];
    updated.splice(mealIndex, 1);
    setMealList(updated);
  }

  /** Save to Supabase */
  async function saveMealToDatabase() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "No logged-in user.");
        return;
      }

      // Validate meal names
      for (const m of mealList) {
        if (!m.name.trim()) {
          Alert.alert("Error", "All meals must have a name.");
          return;
        }
      }

      const formattedMeals = mealList.map((m) => ({
        name: m.name,
        group: m.mealGroup || "",
        notes: m.notes || "",
        meals: m.meals.map((s) => ({
          protein: Number(s.protein || 0),
          calories: Number(s.calories || 0),
        })),
      }));

      const { error } = await supabase.from("meals_test").insert({
        user_id: user.id,
        meal_name: mealTitle,
        meals: formattedMeals,
        data_completed: new Date().toISOString(), // FIXED
      });

      if (error) throw error;

      // Save recent meal summary for RecentMealCard
      await AsyncStorage.setItem(
        "mostRecentMeal",
        JSON.stringify({
          mealName: formattedMeals[0].name,
          protein: formattedMeals[0].meals.reduce((sum, s) => sum + s.protein, 0),
          calories: formattedMeals[0].meals.reduce((sum, s) => sum + s.calories, 0),
          dateCompleted: new Date().toISOString(),
        })
      );

      Alert.alert("Success", "Meal saved!");
      resetMealForm();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save meal");
    }
  }

  /** Reset the form */
  function resetMealForm() {
    setMealTitle("My Meals");
    setMealList([
      { name: "Chicken & Rice", meals: [{ protein: "", calories: "" }] },
    ]);
    Keyboard.dismiss();
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        >
          {mealList.map((meal, mealIndex) => (
            <View key={mealIndex} style={styles.mealCard}>
              <TouchableOpacity
                style={styles.deleteMealBtn}
                onPress={() => removeMeal(mealIndex)}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>x</Text>
              </TouchableOpacity>

              {/* Group + Name */}
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                <Picker
                  selectedValue={meal.mealGroup || ""}
                  style={{ width: 150, height: 40, marginRight: 8 }}
                  onValueChange={(val) => {
                    const updated = [...mealList];
                    updated[mealIndex].mealGroup = String(val);
                    setMealList(updated);
                  }}
                >
                  <Picker.Item label="Select Group" value="" />
                  {predefinedMealGroups.map((g, i) => (
                    <Picker.Item key={i} label={g} value={g} />
                  ))}
                </Picker>

                <TextInput
                  style={[styles.mealName, { flex: 1 }]}
                  value={meal.name}
                  onChangeText={(v) => updateMealName(mealIndex, v)}
                  placeholder="Meal name"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <TextInput
                style={styles.mealNotes}
                value={meal.notes || ""}
                onChangeText={(v) => updateMealNotes(mealIndex, v)}
                placeholder="Notes (optional)"
              />

              {/* Sets */}
              {meal.meals.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {setIndex + 1}</Text>

                  <TextInput
                    style={styles.setInput}
                    value={set.protein}
                    placeholder="Protein"
                    keyboardType="number-pad"
                    onChangeText={(v) =>
                      updateSetValue(mealIndex, setIndex, "protein", v)
                    }
                  />

                  <TextInput
                    style={styles.setInput}
                    value={set.calories}
                    placeholder="Calories"
                    keyboardType="number-pad"
                    onChangeText={(v) =>
                      updateSetValue(mealIndex, setIndex, "calories", v)
                    }
                  />

                  <TouchableOpacity
                    style={styles.deleteSetBtn}
                    onPress={() => removeSet(mealIndex, setIndex)}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>x</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={() => addSetToMeal(mealIndex)}
              >
                <Text style={styles.addBtnText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addExerciseBtn} onPress={addNewMeal}>
            <Text style={styles.addBtnText}>+ Add Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={saveMealToDatabase}>
            <Text style={styles.saveBtnText}>Save Meals</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    paddingTop: Platform.OS === "web" ? 24 : 0,
  },
  cardContainer: {
    width: "95%",
    maxWidth: 600,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mealCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  deleteMealBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  mealName: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 6,
  },
  mealNotes: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: { width: 60, fontWeight: "600" },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginLeft: 8,
    paddingVertical: 6,
    textAlign: "center",
  },
  addSetBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addExerciseBtn: {
    backgroundColor: COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  saveBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  deleteSetBtn: {
    marginLeft: 8,
    backgroundColor: COLORS.red,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
