import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import Colors from "../constants/colors";


export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/safari-bg.png")} // add your safari sunset image here
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>All-in-one planner</Text>
        <Text style={styles.subtitle}>
          Plan South Africa. Prices first, surprises never.
        </Text>

        <Text style={styles.description}>
          Budget-first travel planning — attractions, stays, and activities, all in one place.
          See every rand before you book.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>💰 Budget slider filters out what you can't afford</Text>
          <Text style={styles.feature}>📍 Distance shown to attraction gate, not city centre</Text>
          <Text style={styles.feature}>💎 Hidden gems rated by South African locals</Text>
          <Text style={styles.feature}>👥 Group cost split in one tap</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>Create a free account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          South Africa travel planning · Free forever
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // dark overlay for readability
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.softIvory,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.softIvory,
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.softIvory,
    marginBottom: 20,
  },
  features: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 14,
    color: Colors.softIvory,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.terracottaClay,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: Colors.deepSavannaGreen,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.softIvory,
    fontWeight: "bold",
  },
  footer: {
    fontSize: 12,
    color: Colors.softIvory,
    textAlign: "center",
    marginTop: 20,
  },
});


