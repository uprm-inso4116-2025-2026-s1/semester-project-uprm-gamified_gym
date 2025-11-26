import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, Button, StyleSheet, ImageBackground, TouchableOpacity, LogBox, Image  } from "react-native";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  index: undefined;
  Profile: undefined;
  Settings: undefined;
  Password: undefined;
  ExerciseLog: undefined; 
  MealLog: undefined; 
  Achievements: { from?: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "index"
>;

export default function index() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
      <View style={styles.border}>
        <ImageBackground 
          source={require('../../assets/images/indexbackground.jpg')} 
          style={styles.background}
          resizeMode="cover">
          <View style={styles.container}> 
            <View style={styles.logo}>
              <Text style={styles.logotext}> LOGO HERE </Text>
            </View>       
            {/* <div style={styles.logo}>
              <Text style={styles.logotext}> LOGO HERE </Text>
            </div>        */}
            <View style={styles.logo}>
              <Image source={require('../../assets/images/logo.png')} style={{ width: 140, height: 140, borderRadius: 30 }}/>
            </View>
            <Text style={styles.title}>Welcome to our</Text>
            <Text style={styles.title}>mobile Gamified app</Text>
            <Text style={styles.subtitle1}>If you do not have an account with us, please register here</Text>
            <TouchableOpacity 
              style={styles.signupbutton}
              onPress={() => navigation.navigate("SignUp")}
            >
            <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            {/* <Button style={styles.signupbutton}
              title="Go to SignUp"
              onPress={() => navigation.navigate("SignUp")}
            /> */}
            <Text style={styles.subtitle2}>If you have an account with us, please login here</Text>
            {/* <Button style={styles.loginbutton}
              title="Go to Login"
              onPress={() => navigation.navigate("Login")}
            /> */}
            <TouchableOpacity 
              style={styles.loginbutton}
              onPress={() => navigation.navigate("Login")}
            >
            <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            {/* <Button
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
              /> */}
          </View>



        </ImageBackground>


        {/* Achievements Button */}
        <TouchableOpacity
          style={styles.achievementsButton}
          onPress={() => navigation.navigate("Achievements", { from: "index"})}
        >
          <Text style={styles.achievementsButtonText}>🏆</Text>
        </TouchableOpacity>
      </View>
  );
} 

const BLUE = "#2F80FF";

const styles = StyleSheet.create({
  background: {
    top: 10,
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderColor: BLUE,
    borderWidth: 5,
    borderRadius: 20,
  },
  border: {
    position: 'absolute',
    height: '98%',
    width: '100%',
    borderWidth: 25,
    borderColor: BLUE,
    backgroundColor: BLUE,
    padding: 10,
  },
  logo: {
    position: 'absolute',
    top: 15,
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: BLUE,
  },
  // logotext: {
  //   position: 'absolute',
  //   top: 55,
  //   color: 'white',
  //   fontSize: 20,
  //   fontWeight: 'bold',
  // },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    top: 10,
    width: '100%',
    textAlign: 'center',
  },
  subtitle1: {
    width: '80%',
    textAlign: 'center',
    top: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle2: {
    width: '80%',
    textAlign: 'center',
    top: 70,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  signupbutton: {
    top: 30,
    width: 140,
    height: 40,
  },
  loginbutton: {
    top: 20,
    marginTop: 60,
    width: 140,
    height: 40,
  },
  buttonText: {
    textAlign: 'center',
    width: '100%',
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: BLUE,
    borderRadius: 10,
  },

  achievementsButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2F80FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },

  achievementsButtonText: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
  },

});