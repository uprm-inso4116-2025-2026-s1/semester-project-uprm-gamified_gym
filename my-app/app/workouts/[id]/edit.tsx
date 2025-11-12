import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const colors = {
  bg: '#2E89FF',
  card: '#FFFFFF',
  text: '#0B0F14',
  subtext: 'rgba(0,0,0,0.6)',
  border: 'rgba(0,0,0,0.12)',
  primary: '#2E89FF',
  primaryText: '#FFFFFF',
};

const radii = { card: 16, input: 10, pill: 12 };
const spacing = (n: number) => 4 * n;

type Session = {
  id: string;
  title: string | null;
  notes: string | null;
  updated_at?: string;
};

type ExerciseSet = {
  set_no: number;
  reps: number;
  weight?: number | null;
};

type Exercise = {
  id?: string | null;
  session_id?: string;
  exercise_name: string;
  sets: ExerciseSet[];
  order_index: number;
};

const SESSIONS = 'workout_sessions';
const EXERCISES = 'workout_exercises';

export default function EditSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sessionId = id ? String(id) : '';

  const [session, setSession] = useState<Session | null>(null);
  const [exs, setExs] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // UX extras
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [initialHash, setInitialHash] = useState<string | null>(null);

  // --------- Helpers for "dirty" state ----------
  const snapshot = useMemo(() => {
    return JSON.stringify({
      session: { title: session?.title ?? '', notes: session?.notes ?? '' },
      exs: exs.map(e => ({
        id: e.id ?? null,
        name: e.exercise_name ?? '',
        order_index: e.order_index ?? 0,
        sets: (e.sets ?? []).map((s, i) => ({
          set_no: i + 1,
          reps: Number(s.reps) || 0,
          weight: Number(s.weight ?? 0) || 0,
        })),
      })),
    });
  }, [session?.title, session?.notes, exs]);

  const isDirty = useMemo(() => {
    if (initialHash === null) return false; // no baseline yet
    return snapshot !== initialHash;
  }, [snapshot, initialHash]);

  const hasBaseline = initialHash !== null;
  const saveButtonLabel = loading
    ? 'Saving…'
    : !hasBaseline
    ? 'Saved'
    : isDirty
    ? 'Save'
    : 'Saved';

  // --------- Data fetchers ----------
  const refetch = async (sid: string) => {
    const { data: s, error: es } = await supabase
      .from(SESSIONS)
      .select('id, title, notes, updated_at')
      .eq('id', sid)
      .single();
    if (es) throw es;

    const { data: e, error: ee } = await supabase
      .from(EXERCISES)
      .select('id, exercise_name, sets, order_index')
      .eq('session_id', sid)
      .order('order_index', { ascending: true });
    if (ee) throw ee;

    const normalized = (e ?? []).map((row: any, i: number) => ({
      id: row.id,
      exercise_name: row.exercise_name ?? '',
      sets: Array.isArray(row.sets) ? row.sets : [],
      order_index: typeof row.order_index === 'number' ? row.order_index : i,
    })) as Exercise[];

    setSession({
      id: s.id,
      title: s.title ?? '',
      notes: s.notes ?? '',
      updated_at: s.updated_at,
    });
    setExs(normalized);

    // set baseline after load
    const freshHash = JSON.stringify({
      session: { title: s.title ?? '', notes: s.notes ?? '' },
      exs: normalized.map(e2 => ({
        id: e2.id ?? null,
        name: e2.exercise_name ?? '',
        order_index: e2.order_index ?? 0,
        sets: (e2.sets ?? []).map((ss, i) => ({
          set_no: i + 1,
          reps: Number(ss.reps) || 0,
          weight: Number(ss.weight ?? 0) || 0,
        })),
      })),
    });
    setInitialHash(freshHash);
  };

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        setLoading(true);
        await refetch(sessionId);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  // --------- Local edit handlers ----------
  const addExercise = () => {
    setExs(prev => [
      ...prev,
      {
        id: null,
        exercise_name: '',
        sets: [{ set_no: 1, reps: 0, weight: 0 }],
        order_index: prev.length,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExs(prev => prev.filter((_, i) => i !== index));
  };

  const addSet = (exIndex: number) => {
    setExs(prev => {
      const copy = [...prev];
      const sets = [...copy[exIndex].sets];
      const nextNo = (sets[sets.length - 1]?.set_no ?? 0) + 1;
      sets.push({ set_no: nextNo, reps: 0, weight: 0 });
      copy[exIndex] = { ...copy[exIndex], sets };
      return copy;
    });
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExs(prev => {
      const copy = [...prev];
      const sets = [...copy[exIndex].sets];
      sets.splice(setIndex, 1);
      const renumbered = sets.map((s, i) => ({ ...s, set_no: i + 1 }));
      copy[exIndex] = { ...copy[exIndex], sets: renumbered };
      return copy;
    });
  };

  const onChangeSetField = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setExs(prev => {
      const copy = [...prev];
      const sets = [...copy[exIndex].sets];
      const num = Number((value ?? '').toString().replace(/[^\d.]/g, ''));
      sets[setIndex] = { ...sets[setIndex], [field]: isNaN(num) ? 0 : num };
      copy[exIndex] = { ...copy[exIndex], sets };
      return copy;
    });
  };

  const onChangeExerciseName = (exIndex: number, name: string) => {
    setExs(prev => {
      const copy = [...prev];
      copy[exIndex] = { ...copy[exIndex], exercise_name: name };
      return copy;
    });
  };

  // --------- SAVE (returns rows, refetch, show "Saved") ----------
  const save = async () => {
    if (!session) return;
    if (!session.title || !session.title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    try {
      setLoading(true);

      // 1) Update session (return updated row)
      const { data: updatedSession, error: usErr } = await supabase
        .from(SESSIONS)
        .update({ title: session.title.trim(), notes: (session.notes ?? '').trim() })
        .eq('id', session.id)
        .select('id, title, notes, updated_at')
        .single();
      if (usErr) throw usErr;

      // 2) Upsert children (return ids)
      const toUpsert = exs.map((e, i) => ({
        id: e.id ?? uuidv4(),
        session_id: session.id,
        exercise_name: (e.exercise_name || '').trim() || 'Exercise',
        sets: (e.sets ?? []).map((s, idx) => ({
          set_no: idx + 1,
          reps: Number(s.reps) || 0,
          weight: typeof s.weight === 'number' ? s.weight : Number(s.weight) || 0,
        })),
        order_index: typeof e.order_index === 'number' ? e.order_index : i,
      }));

      const { data: upserted, error: upErr } = await supabase
        .from(EXERCISES)
        .upsert(toUpsert, { onConflict: 'id' })
        .select('id, updated_at');
      if (upErr) throw upErr;

      // 3) Delete removed children
      const { data: serverIds, error: listErr } = await supabase
        .from(EXERCISES)
        .select('id')
        .eq('session_id', session.id);
      if (listErr) throw listErr;

      if (serverIds) {
        const keep = new Set(toUpsert.map(x => x.id as string));
        const toDelete = (serverIds as { id: string }[])
          .map(r => r.id)
          .filter(id2 => !keep.has(id2));
        if (toDelete.length) {
          const { error: delErr } = await supabase.from(EXERCISES).delete().in('id', toDelete);
          if (delErr) throw delErr;
        }
      }

      // 4) Re-fetch canonical truth, reset baseline
      await refetch(session.id);

      // 5) UX stamp
      setSavedAt(new Date().toLocaleTimeString());
      Alert.alert('Success', 'Workout updated.');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Missing session id in route.</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ padding: 16 }}>
        {loading ? <ActivityIndicator /> : <Text>Not found</Text>}
      </View>
    );
  }

  // ---------- SCROLLABLE LAYOUT ----------
  return (
    <>
      <Stack.Screen options={{ title: session?.title ? `Edit: ${session.title}` : 'Edit' }} />

      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <FlatList
          data={exs}
          keyExtractor={(item, idx) => item.id ?? `tmp-${idx}`}
          contentContainerStyle={{
            padding: spacing(4),
            paddingBottom: 140, // space for sticky action bar
            gap: spacing(3),
          }}
          ListHeaderComponent={
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.card,
                padding: spacing(4),
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing(2) }}>
                Session
              </Text>

              <Text style={{ color: colors.subtext, marginBottom: spacing(1) }}>Title</Text>
              <TextInput
                value={session.title ?? ''}
                onChangeText={(t) => setSession(s => ({ ...(s as Session), title: t }))}
                placeholder="e.g., Push Day"
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: radii.input,
                  padding: spacing(3), backgroundColor: '#fff', marginBottom: spacing(3),
                }}
              />

              <Text style={{ color: colors.subtext, marginBottom: spacing(1) }}>Notes</Text>
              <TextInput
                value={session.notes ?? ''}
                onChangeText={(t) => setSession(s => ({ ...(s as Session), notes: t }))}
                placeholder="Notes"
                multiline
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: radii.input,
                  padding: spacing(3), backgroundColor: '#fff', minHeight: 60,
                }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing(3) }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Exercises</Text>
                <TouchableOpacity
                  onPress={addExercise}
                  style={{
                    paddingVertical: spacing(2), paddingHorizontal: spacing(3),
                    backgroundColor: colors.primary, borderRadius: radii.pill,
                  }}
                >
                  <Text style={{ color: colors.primaryText, fontWeight: '700' }}>+ Add exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.card,
                padding: spacing(4),
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>Exercise {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeExercise(index)}
                  style={{ paddingVertical: spacing(1.5), paddingHorizontal: spacing(2.5), borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill }}
                >
                  <Text>Remove</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ marginTop: spacing(2), color: colors.subtext }}>Name</Text>
              <TextInput
                value={item.exercise_name}
                onChangeText={(t) => onChangeExerciseName(index, t)}
                placeholder="e.g., Barbell Bench Press"
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: radii.input,
                  padding: spacing(3), backgroundColor: '#fff',
                }}
              />

              <Text style={{ marginTop: spacing(2), fontWeight: '700', color: colors.text }}>Sets</Text>
              {item.sets.map((s, si) => (
                <View
                  key={si}
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: radii.input,
                    padding: spacing(3), marginTop: spacing(2), backgroundColor: '#fff',
                  }}
                >
                  <Text style={{ marginBottom: spacing(1), color: colors.subtext }}>Set {si + 1}</Text>
                  <View style={{ flexDirection: 'row', gap: spacing(2) }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.subtext }}>Reps</Text>
                      <TextInput
                        keyboardType="number-pad"
                        value={String(s.reps ?? 0)}
                        onChangeText={(v) => onChangeSetField(index, si, 'reps', v)}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing(2.5), backgroundColor: '#fff' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.subtext }}>Weight</Text>
                      <TextInput
                        keyboardType="decimal-pad"
                        value={String(s.weight ?? 0)}
                        onChangeText={(v) => onChangeSetField(index, si, 'weight', v)}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing(2.5), backgroundColor: '#fff' }}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSet(index, si)}
                    style={{ marginTop: spacing(2), paddingVertical: spacing(1.5), paddingHorizontal: spacing(3), borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, alignSelf: 'flex-start' }}
                  >
                    <Text>Remove set</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => addSet(index)}
                style={{ marginTop: spacing(2), paddingVertical: spacing(2), paddingHorizontal: spacing(3), borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, alignSelf: 'flex-start', backgroundColor: '#fff' }}
              >
                <Text>+ Add set</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Sticky action bar */}
        <View
          style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            paddingHorizontal: spacing(4),
            paddingVertical: spacing(3),
            backgroundColor: colors.card,
            borderTopWidth: 1, borderColor: colors.border,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -4 },
            elevation: 10,
          }}
        >
          <View>{savedAt && <Text style={{ color: colors.subtext }}>Saved at {savedAt}</Text>}</View>
          <View style={{ flexDirection: 'row', gap: spacing(3) }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingVertical: spacing(2.5), paddingHorizontal: spacing(4), borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              disabled={loading || !isDirty}
              style={{
                paddingVertical: spacing(2.5), paddingHorizontal: spacing(4), borderRadius: radii.pill,
                backgroundColor: loading || !isDirty ? '#9CC3FF' : colors.primary,
              }}
            >
              <Text style={{ color: colors.primaryText, fontWeight: '800' }}>
                {saveButtonLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
