import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../../lib/supabaseClient";
import { Svg, Circle } from "react-native-svg";
import AsyncStorage from '@react-native-async-storage/async-storage';

/** -------------------------
* HELPERS
* ------------------------- */
async function getUserId(): Promise<string | null> {
  const sess = await supabase.auth.getSession();
  return sess?.data?.session?.user?.id ?? null;
}

async function updateStreak(uid: string, lastWorkoutDate: string | null, currentStreak: number) {
  const today = new Date();
  const lastDate = lastWorkoutDate ? new Date(lastWorkoutDate) : null;
  let newStreak = 1;

  if (lastDate) {
    const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) || 0;
    if (diff === 1) newStreak = currentStreak + 1;
    else if (diff === 0) newStreak = currentStreak;
    else newStreak = 1;
  }

  const { error } = await supabase
    .from("users")
    .update({ streak: newStreak, last_workout_date: today.toISOString() })
    .eq("id", uid);
  
  if (error) {
    console.error("updateStreak error:", error);
    return currentStreak;
  }
  
  return newStreak;
}

/** -------------------------
* COMPONENT
* ------------------------- */
export default function Challenges() {
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyCompletion, setDailyCompletion] = useState(0); // Start at 0%
  const [userId, setUserId] = useState<string | null>(null);
  const [claimingIds, setClaimingIds] = useState<Record<string, boolean>>({});
  const [instantClaimed, setInstantClaimed] = useState(false);

  /** Hardcoded Instant XP Boost challenge */
  const instantChallenge = {
    id: "instant-xp",
    title: "Instant XP Boost",
    description: "Claim 500 XP instantly!",
    type: "daily",
    progress: 100,
    status: "completed",
    claimed: false,
    reward_xp: 500,
    instant: true,
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const uid = await getUserId();
      setUserId(uid);

      // Check if instant XP was already claimed
      const instantClaimedStorage = await AsyncStorage.getItem('instant-xp-claimed');
      setInstantClaimed(instantClaimedStorage === 'true');

      // Load challenges from DB
      const { data: chData, error: chError } = await supabase
        .from("challenges")
        .select("*");
      
      if (chError) {
        console.error("Error loading challenges:", chError);
        setChallenges(instantClaimed ? [] : [instantChallenge]);
      } else {
        const challengesData = chData ?? [];

        let mergedChallenges: any[] = [];
        if (!uid) {
          mergedChallenges = challengesData.map((ch) => ({ 
            ...ch, 
            progress: 0, 
            status: "pending", 
            claimed: false 
          }));
        } else {
          let { data: userChallenges, error: ucError } = await supabase
            .from("user_challenges")
            .select("*")
            .eq("user_id", uid);

          if (ucError) {
            console.error("Error loading user challenges:", ucError);
            userChallenges = [];
          }

          if (!userChallenges || userChallenges.length === 0) {
            const inserts = challengesData.map((ch) => ({
              user_id: uid,
              challenge_id: ch.id,
              progress: 0,
              status: "pending",
              claimed: false,
            }));
            const { error: insertError } = await supabase
              .from("user_challenges")
              .insert(inserts);
            
            if (!insertError) {
              userChallenges = inserts;
            }
          }

          mergedChallenges = challengesData.map((ch) => {
            const uc = userChallenges?.find((u) => u.challenge_id === ch.id);
            const progress = uc?.progress ?? 0;
            const claimed = uc?.claimed ?? false;
            const status = progress >= 100 ? "completed" : "pending";
            return { ...ch, progress, status, claimed };
          });
        }

        const challengesWithInstant = instantClaimed 
          ? mergedChallenges 
          : [instantChallenge, ...mergedChallenges];
        
        setChallenges(challengesWithInstant);
      }

      // Load user data - FIXED: Always start at 0% unless we have real data
      if (uid) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("streak, daily_completion, last_workout_date")
          .eq("id", uid)
          .single();

        if (userError) {
          console.error("Error loading user data:", userError);
          // Start fresh at 0%
          setStreak(0);
          setDailyCompletion(0);
        } else if (user) {
          const newStreak = await updateStreak(uid, user.last_workout_date ?? null, user.streak ?? 0);
          setStreak(newStreak);
          // Use actual user data, or 0 if not available
          setDailyCompletion(user.daily_completion ?? 0);
        }
      } else {
        // Not logged in - start at 0% instead of demo values
        setStreak(0);
        setDailyCompletion(0);
      }
    } catch (e) {
      console.error("Load data error:", e);
      // Start fresh at 0% on error
      setChallenges([instantChallenge]);
      setStreak(0);
      setDailyCompletion(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Filter challenges for current tab */
  const list = challenges
    .filter((c) => c.type.toLowerCase() === tab)
    .sort(() => 0.5 - Math.random());

  /** Claim reward function */
  async function claimReward(ch: any) {
    if (!userId && !ch.instant) {
      Alert.alert("Not logged in", "Please log in to claim regular challenges.");
      return;
    }
    
    if (ch.status !== "completed" || ch.claimed) return;

    setClaimingIds((s) => ({ ...s, [ch.id]: true }));

    try {
      const xpAmount = ch.instant ? 500 : ch.reward_xp;

      // Award XP
      if (userId) {
        const { error: xpError } = await supabase.rpc("increment_user_xp", { 
          uid_in: userId, 
          amount_in: xpAmount 
        });
        
        if (xpError) throw new Error(`XP award failed: ${xpError.message}`);
      }

      // Handle challenge claiming
      if (ch.instant) {
        await AsyncStorage.setItem('instant-xp-claimed', 'true');
        setInstantClaimed(true);
        setChallenges(prev => prev.filter(c => c.id !== ch.id));
      } else {
        const { error: claimError } = await supabase
          .from("user_challenges")
          .update({ claimed: true })
          .eq("user_id", userId)
          .eq("challenge_id", ch.id);

        if (claimError) throw new Error(`Challenge claim failed: ${claimError.message}`);

        setChallenges((prev) => 
          prev.map((c) => 
            c.id === ch.id ? { ...c, claimed: true } : c
          )
        );
      }

      // Update daily completion
      setDailyCompletion((prev) => Math.min(100, prev + 10));

      Alert.alert("Success", `You gained ${xpAmount} XP!`);
    } catch (err: any) {
      console.error("Claim error:", err);
      Alert.alert("Error", err.message || "Could not claim reward");
    } finally {
      setClaimingIds((s) => ({ ...s, [ch.id]: false }));
    }
  }

  const C_R = 38;
  const C_S = 6;

  if (loading) {
    return (
      <View style={[styles.background, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>CHALLENGES</Text>
        <View style={styles.statsRow}>
          <View style={styles.circleWrap}>
            <Svg width={80} height={80} viewBox="0 0 90 90">
              <Circle cx="45" cy="45" r={C_R} stroke="#E5E7EB" strokeWidth={C_S} fill="none" />
              <Circle
                cx="45"
                cy="45"
                r={C_R}
                stroke="#2E89FF"
                strokeWidth={C_S}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * C_R} ${2 * Math.PI * C_R}`}
                strokeDashoffset={2 * Math.PI * C_R * (1 - Math.min(100, dailyCompletion) / 100)}
                rotation="-90"
                origin="45,45"
                fill="none"
              />
            </Svg>
            <Text style={styles.statLabel}>{dailyCompletion}% Daily</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.streakValue}>🔥 {streak}</Text>
          </View>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        {(["daily", "weekly", "monthly"] as const).map((t) => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tabButton, tab === t && styles.tabButtonActive]} 
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CHALLENGE LIST */}
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }} 
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text>No challenges available.</Text>
          </View>
        ) : (
          list.map((c) => (
            <View 
              key={c.id} 
              style={[
                styles.challengeCard,
                c.claimed && styles.claimedCard
              ]}
            >
              <Text style={styles.challengeTitle}>{c.title}</Text>
              <Text style={styles.challengeDesc}>{c.description}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${c.instant ? 100 : c.progress}%` }
                    ]} 
                  />
                </View>
                <Text>{c.instant ? 100 : c.progress}%</Text>
              </View>
              <View style={styles.cardFooter}>
                {c.status === "completed" && !c.claimed && (
                  <TouchableOpacity 
                    style={styles.claimButton} 
                    onPress={() => claimReward(c)} 
                    disabled={claimingIds[c.id]}
                  >
                    <Text style={styles.claimButtonText}>
                      {claimingIds[c.id] ? "Claiming..." : "Claim"}
                    </Text>
                  </TouchableOpacity>
                )}
                {c.claimed && (
                  <View style={styles.claimedBadge}>
                    <Text style={styles.claimedText}>Claimed</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F3F4F6" },
  headerContainer: { paddingHorizontal: 16, marginBottom: 12 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#2E89FF" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  circleWrap: { alignItems: "center" },
  statLabel: { fontSize: 12, color: "#444" },
  streakCard: { 
    width: 80, 
    height: 80, 
    backgroundColor: "#E8F3FF", 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  streakValue: { fontSize: 18, fontWeight: "700" },
  tabsContainer: { 
    flexDirection: "row", 
    marginHorizontal: 16, 
    marginBottom: 10, 
    gap: 6 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 8, 
    backgroundColor: "#E0E7FF", 
    borderRadius: 16, 
    alignItems: "center" 
  },
  tabButtonActive: { backgroundColor: "#2E89FF" },
  tabText: { color: "#444", fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  emptyBox: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 16, 
    alignItems: "center" 
  },
  challengeCard: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 16 
  },
  claimedCard: { 
    backgroundColor: "#f8f8f8", 
    opacity: 0.7 
  },
  challengeTitle: { fontSize: 16, fontWeight: "700" },
  challengeDesc: { fontSize: 13, color: "#555", marginTop: 4 },
  progressRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 10, 
    gap: 6 
  },
  progressBar: { 
    flex: 1, 
    height: 8, 
    backgroundColor: "#DDD", 
    borderRadius: 6, 
    overflow: "hidden" 
  },
  progressBarFill: { 
    height: "100%", 
    backgroundColor: "#2E89FF" 
  },
  cardFooter: { 
    marginTop: 12, 
    flexDirection: "row", 
    justifyContent: "flex-end" 
  },
  claimButton: { 
    backgroundColor: "#111", 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  claimButtonText: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  claimedBadge: { 
    backgroundColor: "#e6f7ee", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 18 
  },
  claimedText: { 
    color: "#059669", 
    fontWeight: "700" 
  },
});