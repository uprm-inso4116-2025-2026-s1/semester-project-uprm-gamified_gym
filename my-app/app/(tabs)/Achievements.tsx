import { Animated, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabaseClient";
import { useFocusEffect } from "@react-navigation/native"; // if not already
import { useCallback } from "react";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type RootStackParamList = {
  Tabs: undefined;
  Achievements: { from?: string };
};

type AchievementsRouteProp = RouteProp<RootStackParamList, "Achievements">;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

type AchievementCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  iconSource: any;
  color?: string;
  description?: string;
  onPress?: () => void;
};

const BLUE = "#2C82FF";

/**
 * Static UI config for each achievement.
 * We key them by "code" so they line up with the DB rows in `achievements`.
 */
type AchievementUiConfig = {
  code: string;
  title: string;
  subtitle: string;
  icon: any;
  color?: string;
  description?: string;
};

const ACHIEVEMENT_CONFIG: AchievementUiConfig[] = [
  {
    code: "first_workout_logged",
    title: "First Workout \nLogged",
    subtitle: "Newcomer",
    icon: require("../../assets/images/achieve1.png"),
    color: "#2C82FF",
    description: "Log your very first workout.",
  },
  {
    code: "five_workouts_logged",
    title: "On a Roll",
    subtitle: "Rookie",
    icon: require("../../assets/images/Achieve2.png"),
    color: "#2C82FF",
    description: "Complete 5 workouts.",
  },
  {
    code: "ten_workouts_logged",
    title: "Consistent",
    subtitle: "Athlete",
    icon: require("../../assets/images/achieve3.png"),
    color: "#2C82FF",
    description: "Complete 10 workouts.",
  },
  {
    code: "twenty_workouts_logged",
    title: "Unstoppable",
    subtitle: "Pro",
    icon: require("../../assets/images/achieve4.png"),
    color: "#2C82FF",
    description: "Complete 20 workouts.",
  },
  {
    code: "one_week_streak",
    title: "One-Week Streak",
    subtitle: "Spark",
    icon: require("../../assets/images/achieve5.png"),
    color: "#2C82FF",
    description: "Work out for 7 days in a row.",
  },
  {
    code: "two_week_streak",
    title: "Two-Week Streak",
    subtitle: "Glow",
    icon: require("../../assets/images/achieve6.png"),
    color: "#2C82FF",
    description: "Work out for 14 days in a row.",
  },
  {
    code: "one_month_streak",
    title: "One-Month Streak",
    subtitle: "Blaze",
    icon: require("../../assets/images/achieve7.png"),
    color: "#2C82FF",
    description: "Work out for 30 days in a row.",
  },
  {
    code: "strength_5000",
    title: "Strength Starter",
    subtitle: "Iron Seed",
    icon: require("../../assets/images/achieve8.png"),
    color: "#2C82FF",
    description: "Lift a total of 5,000 lbs across all workouts.",
  },
  // {
  //   code: "strength_25000",
  //   title: "Strength Climber",
  //   subtitle: "Iron Branch",
  //   icon: require("../../assets/images/achieve1.png"),
  //   color: "#2C82FF",
  //   description: "Lift a total of 25,000 lbs across all workouts.",
  // },
  // {
  //   code: "strength_100000",
  //   title: "Strength Titan",
  //   subtitle: "Iron Colossus",
  //   icon: require("../../assets/images/achieve1.png"),
  //   color: "#2C82FF",
  //   description: "Lift a total of 100,000 lbs across all workouts.",
  // },
  // {
  //   code: "cardio_3",
  //   title: "Cardio Enthusiast",
  //   subtitle: "Heartbeat",
  //   icon: require("../../assets/images/achieve1.png"),
  //   color: "#2C82FF",
  //   description: "Complete 3 cardio-focused workouts.",
  // },
  // {
  //   code: "cardio_10",
  //   title: "Cardio Champion",
  //   subtitle: "Pulse-Runner",
  //   icon: require("../../assets/images/achieve1.png"),
  //   color: "#2C82FF",
  //   description: "Complete 10 cardio-focused workouts.",
  // },
];



type DbAchievement = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type UserAchievement = {
  user_id: string;
  achievement_id: string;
  earned_at: string;
};

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  subtitle,
  progress,
  iconSource,
  color,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 1.06,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={animateIn}
      onHoverOut={animateOut}
      onPressIn={animateIn}
      onPressOut={animateOut}
    >
      <AnimatedLinearGradient
        colors={["#f9fcfdff", "#f9fcfdff", "#f9fcfdff", "#f9fcfdff"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.card, { transform: [{ scale }] }]}
      >
        <Text style={styles.cardTitle}>{title}</Text>

        <View style={styles.cardIconWrapper}>
          <Image source={iconSource} style={styles.cardIcon} />
        </View>

        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{subtitle}</Text>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{progress}%</Text>
          <View style={styles.progressTrack}>
            {/* THIS IS WHERE THE BLUE BAR SIZE COMES FROM */}
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </AnimatedLinearGradient>
    </Pressable>
  );
};

type UiAchievement = AchievementUiConfig & {
  progress: number;
};

const Achievements: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<AchievementsRouteProp>();
  const from = route.params?.from;

const [items, setItems] = useState<UiAchievement[]>([]);
const [selected, setSelected] = React.useState<UiAchievement | null>(null);
const slideAnim = useRef(new Animated.Value(1)).current; // 1 = off-screen

useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const load = async () => {
      // 1) Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in → just show 0% for everything
        const base = ACHIEVEMENT_CONFIG.map((cfg) => ({
          ...cfg,
          progress: 0,
        }));
        if (isActive) setItems(base);
        return;
      }

      // 2) Load achievements & user_achievements from DB
      const { data: dbAchievements, error: dbError } = await supabase
        .from("achievements")
        .select("id, code, name, description");

      const { data: userAchievements, error: userAchError } = await supabase
        .from("user_achievements")
        .select("id, user_id, achievement_id, earned_at")
        .eq("user_id", user.id);

      // 3) Count this user's workouts
      const { count: workoutCount, error: workoutError } = await supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (workoutError) {
        console.error("Error counting workouts:", workoutError);
      }

      const workouts = workoutCount ?? 0;

      // 4) Compute progress for 'first_workout_logged'
      let firstWorkoutProgress = workouts >= 1 ? 100 : 0;

      // 5) Make sure backend user_achievements is synced for first_workout_logged
      const dbFirst = dbAchievements?.find(
        (a: DbAchievement) => a.code === "first_workout_logged"
      );

      const hasFirstAlready =
        !!dbFirst &&
        !!userAchievements?.some(
          (ua: UserAchievement) => ua.achievement_id === dbFirst.id
        );

      if (firstWorkoutProgress === 100 && dbFirst && !hasFirstAlready) {
        // Mark it as earned in the backend
        const { error: insertError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: user.id,
            achievement_id: dbFirst.id,
            earned_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting user_achievement:", insertError);
        }
      }

      // 6) Build UI list with progress
      const combined: UiAchievement[] = ACHIEVEMENT_CONFIG.map((cfg) => {
        const dbRow = dbAchievements?.find(
          (a: DbAchievement) => a.code === cfg.code
        );

        const hasAchievement =
          !!dbRow &&
          !!userAchievements?.some(
            (ua: UserAchievement) => ua.achievement_id === dbRow.id
          );

        let progress = 0;

        if (cfg.code === "first_workout_logged") {
          // Use workout-based progress
          progress = firstWorkoutProgress;
        } else {
          // For now, other achievements are 0% or 100% based on whether they exist in user_achievements
          progress = hasAchievement ? 100 : 0;
        }

        return {
          ...cfg,
          progress,
        };
      });

      if (isActive) {
        setItems(combined);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [])
);


  const openPanel = (item: UiAchievement) => {
    setSelected(item);
    slideAnim.setValue(1);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  const completedCount = items.filter((i) => i.progress >= 100).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.safeBackground}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                  from ? navigation.navigate(from as never) : navigation.goBack()
                }
              >
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>My Achievements</Text>

              <View style={styles.headerBadge}>
                <Image
                  source={require("../../assets/images/medal.png")}
                  style={styles.headerBadgeIcon}
                />
              </View>
            </View>

            <View style={styles.awardPill}>
              <View style={styles.awardDot} />
              <Text style={styles.awardText}>
                Award {completedCount}/{items.length}
              </Text>
            </View>
          </View>

          {/* Cards Grid */}
          <View style={styles.cardsGrid}>
            {items.map((item) => (
              <AchievementCard
                key={item.code}
                title={item.title}
                subtitle={item.subtitle}
                progress={item.progress}
                iconSource={item.icon}
                color={item.color}
                onPress={() => openPanel(item)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Sheet Overlay + Panel */}
        {selected && (
          <>
            <Pressable style={styles.overlay} onPress={closePanel} />
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: selected.color ?? "#ffffff",
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 400],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.sheetHandle} />

              <Text style={styles.sheetTitle}>{selected.title}</Text>
              <Text style={styles.sheetSubtitle}>{selected.subtitle}</Text>

              <Image source={selected.icon} style={styles.sheetIcon} />

              <View style={styles.sheetProgressRow}>
                <Text style={styles.sheetProgressText}>
                  {selected.progress}%
                </Text>
                <View style={styles.sheetProgressTrack}>
                  <View
                    style={[
                      styles.sheetProgressFill,
                      { width: `${selected.progress}%` },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.sheetDescription}>
                {selected.description ?? ""}
              </Text>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Achievements;

/* ------------ STYLES ------------ */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BLUE,
  },
  safeBackground: {
    flex: 1,
    backgroundColor: "#bfbebeff",
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Header */
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFD66B",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeIcon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },

  awardPill: {
    marginTop: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  awardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111827",
    marginRight: 8,
  },
  awardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  cardsGrid: {
    marginTop: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 20,
    rowGap: 20,
  },

  card: {
    width: 300,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  cardIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardIcon: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  ribbon: {
    alignSelf: "center",
    backgroundColor: "#2F855A",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  ribbonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },

  progressRow: {
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: "#4B5563",
    marginBottom: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  sheetHandle: {
    width: 50,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },

  sheetSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },

  sheetIcon: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },

  sheetProgressRow: {
    marginBottom: 10,
  },

  sheetProgressText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  sheetProgressTrack: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
  },

  sheetProgressFill: {
    height: "100%",
    backgroundColor: "#2C82FF",
    borderRadius: 4,
  },

  sheetDescription: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#ffffffff",
  },
});
