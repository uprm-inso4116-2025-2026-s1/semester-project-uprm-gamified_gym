import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabaseClient";
import { RootStackParamList } from "./index";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    console.error("Assertion failed:", message);
    throw new Error(message);
  }
}

function checkNavigationInvariants(navigation: any) {
  assert(navigation != null, "Navigation object must exist before using it");
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  async function fetchUser() {
    const session = supabase.auth.getSession().then(res => res.data.session);
    const user = (await session)?.user;

    if (user) {
      // Fetch user profile
      const { data: profile, error } = await supabase
        .from("user_profiles_test")
        .select("username, profile_picture_url")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setUserName(profile.username);
        setUserAvatar(profile.profile_picture_url);
      }
    } else {
      setUserName(null);
      setUserAvatar(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  useEffect(() => {
    assert(supabase != null, "Supabase client must be initialized before use");

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
              source={userAvatar ? { uri: userAvatar } : require("../../assets/images/user.png")}
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
            onPress={() => navigation.navigate("workoutSelection")}
          >
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>



          <TouchableOpacity style={styles.actionButton}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              checkNavigationInvariants(navigation);
              if (!userName) {
                Alert.alert("Access Denied", "You must be logged in to log a meal.");
                return;
              }
              navigation.navigate("MealLog"); 
            }}
          >
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
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image
            source={require("../../assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            checkNavigationInvariants(navigation);
            if (!userName) {
              Alert.alert("Access Denied", "You must be logged in to access profile.");
              return;
            }
            navigation.navigate("Profile");
          }}
        >
          <Image
            source={require("../../assets/images/user.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={require("../../assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Challenges")}>
          <Image
            source={require("../../assets/images/trophy.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: "92%",
    height: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 20,
    marginTop: 15,
    alignItems: "center",
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexShrink: 1,
    paddingRight: 12,
  },
  avatarWrap: {
    borderRadius: 999,
    padding: 2,
    backgroundColor: "#EAF2FF",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#2E89FF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E89FF",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 10,
    color: "#2E89FF",
    textAlign: "left",
    marginBottom: 0,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 10,
    width: "95%",
  },
  statBox: {
    width: 100,
    height: 80,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statLabel: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#3b3b3bff",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  runningIcon: {
    width: 55,
    height: 55,
    marginHorizontal: 10,
    resizeMode: "contain",
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#2E89FF",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2E89FF",
    paddingHorizontal: 10,
    borderRadius: 23,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
  calendarBox: {
    width: "90%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#2E89FF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 1.41,
    elevation: 5,
  },
  calendarIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 20,
    resizeMode: "contain",
  },
  bottomTabs: {
    position: "absolute",
    backgroundColor: "#ffffff",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    height: 65,
    borderRadius: 35,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    paddingHorizontal: 30,
  },
  navIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#000000ff",
  },
});
