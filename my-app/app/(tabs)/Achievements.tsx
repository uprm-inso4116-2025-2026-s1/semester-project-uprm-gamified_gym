import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAchievementsSupabase as useAchievements } from "./achievementStoreSupabase";
import type { Achievement, AchievementCategory } from "./achievementStoreSupabase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const CATEGORIES: (AchievementCategory | "All")[] = ["All", "Strength", "Consistency", "Progress", "Milestones"];

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Strength: ["#FF6B6B", "#FF8E53"],
  Consistency: ["#4ECDC4", "#44A08D"],
  Progress: ["#A8E6CF", "#56AB2F"],
  Milestones: ["#FFD93D", "#F39C12"],
  All: ["#667EEA", "#764BA2"],
};

export default function Achievements() {
  const insets = useSafeAreaInsets();
  const { achievements, stats } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "All">("All");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const filteredAchievements =
    selectedCategory === "All"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const completionPercentage = Math.round((stats.completed / stats.total) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#2E89FF", "#1E5FCC"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Achievements</Text>
              <Text style={styles.headerSubtitle}>
                {stats.completed} of {stats.total} unlocked
              </Text>
            </View>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="hourglass" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="lock-closed" size={24} color="#9E9E9E" />
              <Text style={styles.statValue}>{stats.locked}</Text>
              <Text style={styles.statLabel}>Locked</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.achievementsGrid,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onPress={() => setSelectedAchievement(achievement)}
            />
          ))}
        </ScrollView>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedAchievement(null)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <LinearGradient
                colors={CATEGORY_COLORS[selectedAchievement.category]}
                style={styles.modalHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.modalIconContainer}>
                  <Ionicons
                    name={selectedAchievement.icon as any}
                    size={64}
                    color="#fff"
                  />
                </View>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDescription}>
                  {selectedAchievement.description}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {selectedAchievement.progress} / {selectedAchievement.target}
                    </Text>
                    <Text style={styles.progressPercentageText}>
                      {Math.round(
                        (selectedAchievement.progress /
                          selectedAchievement.target) *
                          100
                      )}
                      %
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            (selectedAchievement.progress /
                              selectedAchievement.target) *
                              100,
                            100
                          )}%`,
                          backgroundColor:
                            CATEGORY_COLORS[selectedAchievement.category][0],
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Reward */}
                <View style={styles.rewardContainer}>
                  <Ionicons name="gift" size={24} color="#FFD93D" />
                  <Text style={styles.rewardText}>
                    Reward: {selectedAchievement.reward}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedAchievement.progress >= selectedAchievement.target
                          ? "#4CAF50"
                          : selectedAchievement.locked
                          ? "#9E9E9E"
                          : "#FF9800",
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {selectedAchievement.progress >= selectedAchievement.target
                      ? "COMPLETED"
                      : selectedAchievement.locked
                      ? "LOCKED"
                      : "IN PROGRESS"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedAchievement(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function AchievementCard({
  achievement,
  onPress,
}: {
  achievement: Achievement;
  onPress: () => void;
}) {
  const isCompleted = achievement.progress >= achievement.target;
  const progressPercentage = Math.round(
    (achievement.progress / achievement.target) * 100
  );

  return (
    <TouchableOpacity
      style={[
        styles.achievementCard,
        achievement.locked && styles.achievementCardLocked,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          achievement.locked
            ? ["#E0E0E0", "#BDBDBD"]
            : CATEGORY_COLORS[achievement.category]
        }
        style={styles.achievementIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {achievement.locked ? (
          <Ionicons name="lock-closed" size={32} color="#fff" />
        ) : (
          <Ionicons name={achievement.icon as any} size={32} color="#fff" />
        )}
      </LinearGradient>

      <Text style={styles.achievementTitle} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={styles.achievementDescription} numberOfLines={2}>
        {achievement.description}
      </Text>

      {/* Progress */}
      {!achievement.locked && (
        <View style={styles.cardProgressContainer}>
          <View style={styles.cardProgressBar}>
            <View
              style={[
                styles.cardProgressFill,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: CATEGORY_COLORS[achievement.category][0],
                },
              ]}
            />
          </View>
          <Text style={styles.cardProgressText}>{progressPercentage}%</Text>
        </View>
      )}

      {/* Status Badge */}
      {isCompleted && (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2E89FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  categoryScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    maxHeight: 40,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#2E89FF",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  achievementCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  achievementDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  cardProgressContainer: {
    marginTop: 8,
  },
  cardProgressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  cardProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "right",
  },
  completedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 40,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  progressPercentageText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E89FF",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F39C12",
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: "#2E89FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
