import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constants/colors";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = () => {
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    // Later: connect to Supabase/Firebase reset password API
    console.log("Reset link sent to:", email);
    setMessage("If this email exists, a reset link has been sent.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmSand,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.charcoalBrown,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.softIvory,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: Colors.charcoalBrown,
  },
  button: {
    backgroundColor: Colors.deepSavannaGreen,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: Colors.softIvory,
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: Colors.terracottaClay,
    textAlign: "center",
    marginTop: 10,
  },
  message: {
    color: Colors.charcoalBrown,
    marginBottom: 10,
    textAlign: "center",
  },
});
