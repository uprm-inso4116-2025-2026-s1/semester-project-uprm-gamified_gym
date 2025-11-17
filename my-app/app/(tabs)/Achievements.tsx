import { Animated, Pressable } from "react-native";
import React, { useRef } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Tabs: undefined;
  Achievements: { from?: string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type AchievementCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  iconSource: any;
  onPress?: () => void;
};

const BLUE = "#2C82FF";

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  subtitle,
  progress,
  iconSource,
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
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        
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

      </Animated.View>
    </Pressable>
  );
};

const achievementsList = [
  { title: "Ranked", subtitle: "Star", progress: 0 },
  { title: "Streaks", subtitle: "Freshman", progress: 0 },
  { title: "Strength", subtitle: "Sophomore", progress: 0 },
  { title: "Holidays", subtitle: "Sophomore", progress: 0 },

  // ⭐ Add 9 more
  { title: "Flexibility", subtitle: "Bronze", progress: 0 },
  { title: "Cardio", subtitle: "Rookie", progress: 0 },
  { title: "Endurance", subtitle: "Silver", progress: 0 },
  { title: "Consistency", subtitle: "Gold", progress: 0 },
  { title: "Hydration", subtitle: "Hydrated", progress: 0 },
  { title: "Calories Burned", subtitle: "Burner", progress: 0 },
  { title: "Workouts Logged", subtitle: "Tracker", progress: 0 },
  { title: "Daily Check-ins", subtitle: "Visitor", progress: 0 },
  { title: "Gym Time", subtitle: "Grinder", progress: 0 },
];


const Achievements: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { from } = route.params as { from?: string };
  const [selected, setSelected] = React.useState<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current; // 1 = off-screen

  const openPanel = (item: any) => {
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
              <Text style={styles.awardText}>Award 1/10</Text>
            </View>
          </View>

{/* Cards Grid */}
<View style={styles.cardsGrid}>
  {achievementsList.map((item, index) => (
    <AchievementCard
      key={index}
      title={item.title}
      subtitle={item.subtitle}
      progress={item.progress}
      iconSource={require("../../assets/images/medal.png")}
      onPress={() => openPanel(item)}   // ⭐ NOW WORKS ⭐
    />
  ))}
</View>
        </ScrollView>
        {/* ⭐ Bottom Sheet Overlay + Panel ⭐ */}
{selected && (
  <>
    <Pressable style={styles.overlay} onPress={closePanel} />

    <Animated.View
      style={[
        styles.bottomSheet,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 400],  // slide from bottom
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
        source={require("../../assets/images/medal.png")}
        style={styles.sheetIcon}
      />

      <View style={styles.sheetProgressRow}>
        <Text style={styles.sheetProgressText}>{selected.progress}%</Text>
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
        This achievement tracks your {selected.title.toLowerCase()}. Keep
        progressing to unlock rewards!
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
    backgroundColor: "#44474fff",
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
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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
  color: "#444",
},

});
