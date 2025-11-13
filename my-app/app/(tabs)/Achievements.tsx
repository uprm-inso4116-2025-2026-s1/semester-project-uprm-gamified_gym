import React from "react";
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
};

const BLUE = "#2C82FF";

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  subtitle,
  progress,
  iconSource,
}) => {
  return (
    <View style={styles.card}>
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
    </View>
  );
};

const Achievements: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { from } = route.params as { from?: string };


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
              <AchievementCard
    title="Ranked"
    subtitle="Star"
    progress={0}
    iconSource={require("../../assets/images/medal.png")}
  />
  <AchievementCard
    title="Streaks"
    subtitle="Freshman"
    progress={0}
    iconSource={require("../../assets/images/medal.png")}
  />
  <AchievementCard
    title="Strength"
    subtitle="Sophomore"
    progress={0}
    iconSource={require("../../assets/images/medal.png")}
  />
  <AchievementCard
    title="Holidays"
    subtitle="Sophomore"
    progress={0}
    iconSource={require("../../assets/images/medal.png")}
  />
          </View>
        </ScrollView>
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
    backgroundColor: "#F3F4F6",
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
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "30%",
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
});
