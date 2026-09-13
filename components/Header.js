import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // install with: npm install @expo/vector-icons
import Colors from "../constants/colors";

export default function Header({ navigation }) {
  return (
    <View style={styles.header}>
      {/* Left side: App title */}
      <View>
        <Text style={styles.appTitle}>ALL-IN-ONE-PLANNER</Text>
        <Text style={styles.subTitle}>DISCOVER South Africa</Text>
      </View>

      {/* Right side: Greeting + buttons */}
      <View style={styles.rightSection}>
        <Text style={styles.greeting}>Hi, Mangi</Text>

        <TouchableOpacity onPress={() => navigation.replace("SignIn")}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dayPlanButton}>
          <Ionicons name="calendar-outline" size={18} color={Colors.softIvory} />
          <Text style={styles.dayPlanText}>Day Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
  backgroundColor: "#1B3A2E", // dark green like your picture
  paddingVertical: 15,
  paddingHorizontal: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

  appTitle: {
    color: Colors.softIvory,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  subTitle: {
    color: Colors.softIvory,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    color: Colors.softIvory,
    fontSize: 14,
    marginRight: 10,
  },
  signOut: {
    color: Colors.terracottaClay,
    fontSize: 14,
    marginRight: 10,
  },
  dayPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.terracottaClay,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dayPlanText: {
    color: Colors.softIvory,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
