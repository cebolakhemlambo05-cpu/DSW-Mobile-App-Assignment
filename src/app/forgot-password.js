import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert("Missing info", "Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const otp = generateOtp();
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&code=${otp}&next=${encodeURIComponent("/sign-in")}`
      );
    }, 800);
  };

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email linked to your account and we'll send you a verification code.
          </Text>

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

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Sending…" : "Send reset code"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backButton: { marginBottom: 24 },
  backButtonText: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  title: { color: colors.charcoal, fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: "rgba(62,50,38,0.7)", fontSize: 15, lineHeight: 21, marginBottom: 32, maxWidth: 320 },
  field: { marginBottom: 18 },
  label: { color: colors.charcoal, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.12)",
  },
  primaryButton: { marginTop: 12, backgroundColor: colors.clay, borderRadius: 28, paddingVertical: 16, alignItems: "center" },
  primaryButtonText: { color: colors.ivory, fontSize: 16, fontWeight: "700" },
});
