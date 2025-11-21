import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer, RouteProp } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";   // ⭐ NEW
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddWorkout from "./AddWorkout";
import Profile from "./Profile";                   // ⭐ Use your REAL Profile page
import Achievements from "./Achievements";         // ⭐ Add your Achievements page
import Settings from "./Settings";                 // ⭐ Add Settings page

/** ---- Navigation types ---- */
type BottomTabParamList = {
  Home: undefined;
  Add: undefined;
  Profile: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  Tabs: undefined;          // ⭐ Main Tab Navigator
  Achievements: undefined;  // ⭐ New Page outside Tabs
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>(); // ⭐ NEW

/** ---- UI constants ---- */
const BLUE = "#2C82FF";
const CARD_BG = "#FFFFFF";
const TAB_HEIGHT = 64;

const LIGHT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

/* ---------- Screens ---------- */

function HomeScreen({ navigation }: BottomTabScreenProps<BottomTabParamList, "Home">) {
  const insets = useSafeAreaInsets();
  const bottomOffset = TAB_HEIGHT + 10 + Math.max(insets.bottom - 4, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomOffset + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCard}>
          <View style={styles.topCardHeader}>
            <Text style={styles.topCardTitle}>How are you feeling today?</Text>
          </View>
          <View style={styles.topCardBody} />
        </View>
      </ScrollView>

      <View style={[styles.bottomSheet, { bottom: bottomOffset }]}>
        <Text style={styles.sectionTitle}>What do you want to create or add?</Text>

        <View style={styles.actionGroup}>
          <ActionPill icon={<Ionicons name="image-outline" size={18} />} label="Create Post" onPress={() => {}} />
          <ActionPill
            icon={<MaterialCommunityIcons name="dumbbell" size={18} />}
            label="Add Workout"
            onPress={() => navigation.navigate("Add")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

type ActionPillProps = { icon: React.ReactNode; label: string; onPress: () => void };

function ActionPill({ icon, label, onPress }: ActionPillProps) {
  return (
    <TouchableOpacity style={styles.pill} activeOpacity={0.75} onPress={onPress}>
      <View style={styles.pillIcon}>{icon}</View>
      <Text style={styles.pillText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** ---- Tabs ---- */
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<BottomTabParamList, keyof BottomTabParamList>;
      }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_HEIGHT,
          backgroundColor: BLUE,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          height: TAB_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIcon: ({ focused }) => {
          const c = focused ? "#111" : "rgba(0,0,0,0.55)";
          const name =
            route.name === "Home"
              ? "home"
              : route.name === "Add"
              ? "add-circle"
              : route.name === "Profile"
              ? "person"
              : "settings";

          return (
            <View style={{ justifyContent: "center", alignItems: "center", height: TAB_HEIGHT }}>
              <Ionicons name={name as any} size={24} color={c} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddWorkout} />
      <Tab.Screen name="Profile" component={Profile} />  {/* ⭐ REAL Profile */}
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

/** ---- App ROOT (Stack + Tabs) ---- */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Tabs" component={Tabs} />

        {/* ⭐ Achievements is OUTSIDE the tabs */}
        <Stack.Screen name="Achievements" component={Achievements} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

/** ---- Styles ---- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16 },
  topCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    ...LIGHT_SHADOW,
    overflow: "hidden",
    marginBottom: 16,
  },
  topCardHeader: { paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
  topCardTitle: { fontSize: 20, fontWeight: "600", color: "#333", opacity: 0.9 },
  topCardBody: { height: 0, backgroundColor: "#D9D9D9" },

  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: CARD_BG,
    borderRadius: 22,
    ...LIGHT_SHADOW,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#2C2C2C", marginBottom: 10 },
  actionGroup: { gap: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECECEC",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pillText: { fontSize: 14.5, fontWeight: "600", color: "#1F1F1F" },
});
