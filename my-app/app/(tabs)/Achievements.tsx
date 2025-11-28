import { Animated, Pressable } from "react-native";
import React, { useRef, useEffect } from "react";
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
  onPress?: () => void;
};

type AchievementConfig = {
  code: string; // matches achievements.code in Supabase
  title: string;
  subtitle: string;
  icon?: any;
  color?: string;
  description: string;
};

type AchievementItem = AchievementConfig & {
  progress: number; // 0–100
  earnedAt?: string | null;
};

const BLUE = "#2C82FF";

/** Local achievement definitions (front-end only metadata) */
const BASE_ACHIEVEMENTS: AchievementItem[] = [
  {
    code: "first_workout_logged",
    title: "First Workout \n Logged",
    subtitle: "Star",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    color: "#2C82FF",
    description: "Log your first workout in Gamified Gym.",
  },

  // You can give these real codes/descriptions later
  {
    code: "streak_3_days",
    title: "Streaks",
    subtitle: "Freshman",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Complete workouts 3 days in a row.",
  },
  {
    code: "strength_1",
    title: "Strength",
    subtitle: "Sophomore",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Finish your first strength-focused workout.",
  },
  {
    code: "holiday_workout",
    title: "Holidays",
    subtitle: "Sophomore",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Do a workout on a holiday.",
  },
  {
    code: "flexibility_1",
    title: "Flexibility",
    subtitle: "Bronze",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Complete a stretching or flexibility routine.",
  },
  {
    code: "cardio_1",
    title: "Cardio",
    subtitle: "Rookie",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Finish your first pure cardio workout.",
  },
  {
    code: "endurance_1",
    title: "Endurance",
    subtitle: "Silver",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Stay active for a long session without giving up.",
  },
  {
    code: "consistency_1",
    title: "Consistency",
    subtitle: "Gold",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Work out several times in one week.",
  },
  {
    code: "hydration_1",
    title: "Hydration",
    subtitle: "Hydrated",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Track your water intake while working out.",
  },
  {
    code: "calories_burned_1",
    title: "Calories Burned",
    subtitle: "Burner",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Burn a significant number of calories in a session.",
  },
  {
    code: "workouts_logged_5",
    title: "Workouts Logged",
    subtitle: "Tracker",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Log multiple workouts in Gamified Gym.",
  },
  {
    code: "daily_checkins_1",
    title: "Daily Check-ins",
    subtitle: "Visitor",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Open the app and check in for the day.",
  },
  {
    code: "gym_time_1",
    title: "Gym Time",
    subtitle: "Grinder",
    progress: 0,
    icon: require("../../assets/images/achieve1.png"),
    description: "Spend serious time finishing a full workout.",
  },
];

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
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </AnimatedLinearGradient>
    </Pressable>
  );
};

const Achievements: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<AchievementsRouteProp>();
  const from = route.params?.from;

  const [achievements, setAchievements] =
    React.useState<AchievementItem[]>(BASE_ACHIEVEMENTS);
  const [loading, setLoading] = React.useState(false);

  const [selected, setSelected] = React.useState<AchievementItem | null>(null);
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = off-screen

  const openPanel = (item: AchievementItem) => {
    setSelected(item);
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

  // ---------- Load user achievements from Supabase ----------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          console.log("No logged-in user for achievements:", userError);
          // Just show all as locked
          if (isMounted) setAchievements(BASE_ACHIEVEMENTS);
          return;
        }

        const user = userData.user;

        // user_achievements with joined achievements (for .code)
        const { data, error } = await supabase
          .from("user_achievements")
          .select("achievement_id, earned_at, achievements ( code )")
          .eq("user_id", user.id);

        if (error) {
          console.log("Error loading user_achievements:", error);
          if (isMounted) setAchievements(BASE_ACHIEVEMENTS);
          return;
        }

        const earned = (data ?? []) as any[];

        const earnedCodes = new Set<string>(
          earned
            .map((row) => row.achievements?.code as string | undefined)
            .filter((c): c is string => !!c)
        );

        const mapped: AchievementItem[] = BASE_ACHIEVEMENTS.map((base) => {
          const match = earned.find(
            (row) => row.achievements?.code === base.code
          );
          const hasIt = !!match;

          return {
            ...base,
            progress: hasIt ? 100 : 0,
            earnedAt: match?.earned_at ?? null,
          };
        });

        if (isMounted) {
          setAchievements(mapped);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const earnedCount = achievements.filter((a) => a.progress >= 100).length;
  const totalCount = achievements.length;

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
                Award {earnedCount}/{totalCount}
              </Text>
            </View>
          </View>

          {/* Cards Grid */}
          <View style={styles.cardsGrid}>
            {achievements.map((item, index) => (
              <AchievementCard
                key={item.code ?? index}
                title={item.title}
                subtitle={item.subtitle}
                progress={item.progress}
                iconSource={
                  item.icon ?? require("../../assets/images/achieve1.png")
                }
                color={item.color}
                onPress={() => openPanel(item)}
              />
            ))}
          </View>

          {loading && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 12,
                color: "#4B5563",
              }}
            >
              Loading achievements…
            </Text>
          )}
        </ScrollView>

        {/* Bottom Sheet Overlay + Panel */}
        {selected && (
          <>
            <Pressable style={styles.overlay} onPress={closePanel} />

            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: selected?.color ?? "#ffffff",
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

              <Image
                source={
                  selected.icon ?? require("../../assets/images/achieve1.png")
                }
                style={styles.sheetIcon}
              />

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
                {selected.description}
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
    width: 72,
    height: 72,
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
