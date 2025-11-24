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
  
  const DEFAULT_CARDIO_EXERCISES: ExercisePayload[] = [
  { name: "Running", sets: 1, reps: 1, duration: "30 min", category: "Cardio" },
  { name: "Treadmill", sets: 1, reps: 1, duration: "20 min", category: "Cardio" },
  { name: "Cycling", sets: 1, reps: 1, duration: "30 min", category: "Cardio" },
  { name: "Elliptical", sets: 1, reps: 1, duration: "25 min", category: "Cardio" },
  { name: "Jump Rope", sets: 3, reps: 100, duration: "5 min", category: "Cardio" },
  { name: "Rowing Machine", sets: 1, reps: 1, duration: "20 min", category: "Cardio" },
  { name: "Stair Climber", sets: 1, reps: 1, duration: "15 min", category: "Cardio" },
  { name: "Swimming", sets: 1, reps: 1, duration: "30 min", category: "Cardio" },
  { name: "HIIT Training", sets: 4, reps: 10, duration: "20 min", category: "Cardio" },
  { name: "Burpees", sets: 3, reps: 15, duration: "10 min", category: "Cardio" },
];

export function ExerciseProvider({ children }: ProviderProps) {
    const [savedExercises, setSavedExercises] = useState<ExerciseItem[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as ExerciseItem[];
            setSavedExercises(parsed);
          } else {
            // First time load - add default cardio exercises
            const defaultExercises = DEFAULT_CARDIO_EXERCISES.map((ex, idx) => ({
              ...ex,
              id: `default-cardio-${idx}-${Date.now()}`,
            }));
            setSavedExercises(defaultExercises);
            await AsyncStorage.setItem(KEY, JSON.stringify(defaultExercises));
          }
          setHasInitialized(true);
        } catch (e) {
          console.warn("Load saved exercises failed", e);
          setHasInitialized(true);
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
  