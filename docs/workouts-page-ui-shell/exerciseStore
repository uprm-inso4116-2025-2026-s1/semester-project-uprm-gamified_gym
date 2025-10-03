import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "saved_exercises_v1";
const ExercisesCtx = createContext(null);

export function ExerciseProvider({ children }) {
  const [savedExercises, setSavedExercises] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSavedExercises(JSON.parse(raw));
      } catch (e) {
        console.warn("Load saved exercises failed", e);
      }
    })();
  }, []);

  const persist = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Persist saved exercises failed", e);
    }
  }, []);

  const addExercise = useCallback((ex) => {
    setSavedExercises((prev) => {
      const next = [...prev, { ...ex, id: `ex-${Date.now()}` }];
      persist(next);
      return next;
    });
  }, [persist]);

  const updateExerciseAt = useCallback((index, patch) => {
    setSavedExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteExerciseAt = useCallback((index) => {
    setSavedExercises((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      persist(next);
      return next;
    });
  }, [persist]);

  const value = {
    savedExercises,
    addExercise,
    updateExerciseAt,
    deleteExerciseAt,
  };

  return <ExercisesCtx.Provider value={value}>{children}</ExercisesCtx.Provider>;
}

export function useExercises() {
  const ctx = useContext(ExercisesCtx);
  if (!ctx) throw new Error("useExercises must be used inside <ExerciseProvider>");
  return ctx;
}
