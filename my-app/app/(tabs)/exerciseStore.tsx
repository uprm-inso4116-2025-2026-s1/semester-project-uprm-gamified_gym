import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
  } from "react";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const KEY = "saved_exercises_v1";
  
  /** Types */
  export type ExerciseCategory =
    | "Chest"
    | "Back"
    | "Legs"
    | "Biceps"
    | "Triceps"
    | "Shoulders"
    | "Core"
    | "Cardio";

  export type ExercisePayload = {
    name: string;
    sets: number;
    reps: number;
    duration?: string;
    category: ExerciseCategory;
  };
  
  export type ExerciseItem = ExercisePayload & {
    id: string;
  };
  
  export type ExercisesContext = {
    savedExercises: ExerciseItem[];
    addExercise: (ex: ExercisePayload) => void;
    updateExerciseAt: (index: number, patch: Partial<ExercisePayload>) => void;
    deleteExerciseAt: (index: number) => void;
  };
  
  const ExercisesCtx = createContext<ExercisesContext | null>(null);
  
  type ProviderProps = {
    children: ReactNode;
  };
  
  export function ExerciseProvider({ children }: ProviderProps) {
    const [savedExercises, setSavedExercises] = useState<ExerciseItem[]>([]);
  
    useEffect(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as ExerciseItem[];
            setSavedExercises(parsed);
          }
        } catch (e) {
          console.warn("Load saved exercises failed", e);
        }
      })();
    }, []);
  
    const persist = useCallback(async (list: ExerciseItem[]) => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(list));
      } catch (e) {
        console.warn("Persist saved exercises failed", e);
      }
    }, []);
  
    const addExercise = useCallback(
      (ex: ExercisePayload) => {
        setSavedExercises((prev) => {
          const next: ExerciseItem[] = [...prev, { ...ex, id: `ex-${Date.now()}` }];
          void persist(next);
          return next;
        });
      },
      [persist]
    );
  
    const updateExerciseAt = useCallback(
      (index: number, patch: Partial<ExercisePayload>) => {
        setSavedExercises((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], ...patch };
          void persist(next);
          return next;
        });
      },
      [persist]
    );
  
    const deleteExerciseAt = useCallback(
      (index: number) => {
        setSavedExercises((prev) => {
          const next = [...prev];
          next.splice(index, 1);
          void persist(next);
          return next;
        });
      },
      [persist]
    );
  
    const value: ExercisesContext = {
      savedExercises,
      addExercise,
      updateExerciseAt,
      deleteExerciseAt,
    };
  
    return <ExercisesCtx.Provider value={value}>{children}</ExercisesCtx.Provider>;
  }
  
  export function useExercises(): ExercisesContext {
    const ctx = useContext(ExercisesCtx);
    if (!ctx) throw new Error("useExercises must be used inside <ExerciseProvider>");
    return ctx;
  }
  