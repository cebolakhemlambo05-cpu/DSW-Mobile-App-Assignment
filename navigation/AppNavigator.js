import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import HomeScreen from "../screens/HomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SignInScreen from "../screens/SignInScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"; // Import the ForgotPasswordScreen
import HomePage from "../screens/HomePage"; // Import the HomePage screen
import AttractionDetails from "../screens/AttractionDetails";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#3A5A40" }, // Deep Savanna Green
          headerTintColor: "#FAF6EF", // Soft Ivory
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "All-in-one Planner" }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Create Account" }}
        />

         <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={{ title: "Discover South Africa" }}
        />

        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Sign In" }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: "Forgot Password" }}
        />
        <Stack.Screen name="AttractionDetails" component={AttractionDetails} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
