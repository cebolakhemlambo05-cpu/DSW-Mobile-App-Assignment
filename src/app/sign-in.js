import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/colors";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Extract name from email (before @)
      const userName = email.split('@')[0] || "Guest";
      // Capitalize first letter
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      Alert.alert("Success!", "Signed in successfully!", [
        { text: "Continue", onPress: () => router.push(`/home?name=${formattedName}`) },
      ]);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to pick up where you left off planning your trip.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(62,50,38,0.4)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="rgba(62,50,38,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.showButton}>
                <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleSignIn} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{loading ? "Signing in…" : "Sign in"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/create-account")}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Create one</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backButton: { marginBottom: 24 },
  backButtonText: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  title: { color: colors.charcoal, fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: "rgba(62,50,38,0.7)", fontSize: 15, lineHeight: 21, marginBottom: 32, maxWidth: 320 },
  field: { marginBottom: 18 },
  label: { color: colors.charcoal, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { backgroundColor: colors.ivory, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.charcoal, borderWidth: 1, borderColor: "rgba(62,50,38,0.12)" },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  showButton: { paddingHorizontal: 8, paddingVertical: 10 },
  showButtonText: { color: colors.skyBlue, fontSize: 13, fontWeight: "700" },
  primaryButton: { marginTop: 12, backgroundColor: colors.clay, borderRadius: 28, paddingVertical: 16, alignItems: "center" },
  primaryButtonText: { color: colors.ivory, fontSize: 16, fontWeight: "700" },
  linkRow: { marginTop: 20, alignItems: "center" },
  linkText: { color: "rgba(62,50,38,0.7)", fontSize: 14 },
  linkTextBold: { color: colors.savanna, fontWeight: "700" },
});
