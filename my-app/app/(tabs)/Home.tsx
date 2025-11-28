import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabaseClient";
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  moderateScale,
  widthPercentage,
  heightPercentage,
  platformSpacing,
} from "../../utils/responsive";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ExerciseLog: undefined;
  ExerciseLibrary: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const session = supabase.auth.getSession().then(res => res.data.session);
      const user = (await session)?.user;

      if (user) {
        // Fetch user profile
        const { data: profile, error } = await supabase
          .from("user_profiles_test")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          setUserName(profile.username);
        }
      } else {
        setUserName(null);
      }
    }

    fetchUser();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setUserName(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.background}>
      <View style={styles.homeCard}>
        {/* Header with avatar on the right */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>HOME</Text>

            {userName ? (
              <Text style={styles.subtitle}>Welcome back, {userName}!</Text>
            ) : (
              <Text style={styles.subtitle}>
                Welcome,{" "}
                <Text
                  style={styles.linkUnderline}
                  onPress={() => navigation.navigate("Login")}
                >
                  Log in
                </Text>
              </Text>
            )}
          </View>

          {/* Avatar */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.avatarWrap}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              source={require("../../assets/images/user.png")}
              style={styles.avatar}
              accessibilityLabel="User profile"
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: "#FFEB0C" }]}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>2,345</Text>
          </View>

          <Image
            source={require("../../assets/images/athletics.png")}
            style={styles.runningIcon}
          />

          <View style={[styles.statBox, { backgroundColor: "#FF59B7" }]}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>400</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.quickTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("ExerciseLog")}
          >
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <TouchableOpacity style={styles.calendarBox}>
          <Image
            source={require("../../assets/images/calendar.png")}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.7}>
          <Ionicons name="home-outline" size={scaleWidth(28)} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ExerciseLibrary")} activeOpacity={0.7}>
          <Ionicons name="barbell-outline" size={scaleWidth(28)} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={scaleWidth(28)} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={scaleWidth(28)} color="#000000" />
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2E89FF",
  },
  linkUnderline: {
    color: "#2E89FF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  background: {
    flex: 1,
    backgroundColor: "#2E89FF",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  homeCard: {
    width: widthPercentage(92),
    height: heightPercentage(82),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(23),
    padding: moderateScale(20),
    marginTop: moderateScale(15),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: scaleWidth(2), height: scaleHeight(2) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(3.84),
    elevation: 5,
  },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(20),
  },
  headerLeft: {
    flexShrink: 1,
    paddingRight: moderateScale(12),
  },
  avatarWrap: {
    borderRadius: 999,
    padding: moderateScale(2),
    backgroundColor: "#EAF2FF",
  },
  avatar: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(28),
    borderWidth: 2,
    borderColor: "#2E89FF",
  },

  title: {
    fontSize: scaleFontSize(28),
    fontWeight: "bold",
    color: "#2E89FF",
    textAlign: "left",
  },
  subtitle: {
    fontSize: scaleFontSize(16),
    fontStyle: "italic",
    marginVertical: moderateScale(10),
    color: "#2E89FF",
    textAlign: "left",
    marginBottom: 0,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: moderateScale(10),
    width: "95%",
  },
  statBox: {
    width: scaleWidth(100),
    height: scaleHeight(80),
    borderRadius: moderateScale(23),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: scaleWidth(2), height: scaleHeight(2) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(1.41),
    elevation: 2,
  },
  statLabel: {
    fontSize: scaleFontSize(17),
    fontStyle: "italic",
    color: "#3b3b3bff",
  },
  statValue: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    color: "#000",
  },
  runningIcon: {
    width: scaleWidth(55),
    height: scaleWidth(55),
    marginHorizontal: moderateScale(10),
    resizeMode: "contain",
  },

  quickTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "bold",
    marginTop: moderateScale(10),
    marginBottom: moderateScale(5),
    color: "#2E89FF",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: moderateScale(15),
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2E89FF",
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(23),
    marginHorizontal: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    height: scaleHeight(70),
    shadowColor: "#000",
    shadowOffset: { width: scaleWidth(2), height: scaleHeight(2) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(1.41),
    elevation: 5,
  },
  actionText: {
    fontSize: scaleFontSize(14),
    color: "#000000",
    fontWeight: "bold",
  },
  calendarBox: {
    width: widthPercentage(90),
    height: scaleHeight(220),
    borderRadius: moderateScale(10),
    backgroundColor: "#2E89FF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: scaleWidth(2), height: scaleHeight(2) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(1.41),
    elevation: 5,
  },
  calendarIcon: {
    width: scaleWidth(50),
    height: scaleWidth(50),
    marginHorizontal: moderateScale(20),
    resizeMode: "contain",
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#ffffff",
    bottom: platformSpacing(20, 16),
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: widthPercentage(90),
    height: scaleHeight(65),
    borderRadius: moderateScale(35),
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scaleHeight(4) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(5),
    elevation: 6,
    paddingHorizontal: moderateScale(30),
  },
});
