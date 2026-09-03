import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/colors";

export default function CreateAccountScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleCreateAccount = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please fill in all fields.");
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
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please re-enter matching passwords.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Use the name from the form
      const userName = name.trim() || "Guest";
      Alert.alert("Account created!", "Welcome aboard.", [
        { text: "Continue", onPress: () => router.push(`/home?name=${userName}`) },
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

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Free forever — start planning your South Africa trip with real prices.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} placeholder="Thabo Mokoena" placeholderTextColor="rgba(62,50,38,0.4)" value={name} onChangeText={setName} autoCapitalize="words" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="rgba(62,50,38,0.4)" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="At least 6 characters" placeholderTextColor="rgba(62,50,38,0.4)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.showButton}>
                <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor="rgba(62,50,38,0.4)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
          </View>

          <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleCreateAccount} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{loading ? "Creating account…" : "Create a free account"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/sign-in")}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Sign in</Text></Text>
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
