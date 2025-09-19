import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Button, StyleSheet } from "react-native";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  index: undefined;
  Profile: undefined;
  Settings: undefined;
  Password: undefined;
  ExerciseLog: undefined; 
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "index"
>;

export default function index() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Index Page</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate("Login")}
      />
      <Button
        title="Go to SignUp"
        onPress={() => navigation.navigate("SignUp")}
      />
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate("Home")}
      />
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate("Profile")}
      />    
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate("Settings")}
      />
      <Button
        title="Go to Password"
        onPress={() => navigation.navigate("Password")}
      />
      <Button
        title = "Go to Exercises"
        onPress={() => navigation.navigate("ExerciseLog")}
        />

    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // make sure background is visible
  },
  title: {
    fontSize: 24,
    color: "teal",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "black",
  },
});