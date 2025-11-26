import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface MealSummary {
  mealName: string;
  protein: number;
  calories: number;
  dateCompleted: string;
}

export default function RecentMealSummary() {
  const [latestMeal, setLatestMeal] = useState<MealSummary | null>(null);

  useEffect(() => {
    async function fetchRecentMeal() {
      try {
        const savedMeal = await AsyncStorage.getItem("mostRecentMeal");
        if (savedMeal) {
          setLatestMeal(JSON.parse(savedMeal));
        } else {
          setLatestMeal({
            mealName: "Sample Meal",
            protein: 20,
            calories: 300,
            dateCompleted: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn("Failed to load recent Meal:", error);
      }
    }

    fetchRecentMeal();
  }, []);

  if (!latestMeal) return null;

  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>Most Recent Meal</Text>

      <MealDetail label="Meal" value={latestMeal.mealName} />
      <MealDetail label="Protein" value={String(latestMeal.protein)} />
      <MealDetail label="Calories" value={String(latestMeal.calories)} />
      <MealDetail
        label="Date"
        value={new Date(latestMeal.dateCompleted).toLocaleDateString()}
      />
    </TouchableOpacity>
  );
}

function MealDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#222",
  },
});
