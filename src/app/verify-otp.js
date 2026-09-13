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
import { router, useLocalSearchParams } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";

export default function VerifyOtpScreen() {
  const { email, code, next } = useLocalSearchParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!input.trim()) {
      Alert.alert("Missing code", "Please enter the 6-digit code.");
      return;
    }
    if (input.trim() !== code) {
      Alert.alert("Incorrect code", "That code doesn't match. Please try again.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace(next || "/home");
    }, 500);
  };

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email || "your email"}.
          </Text>

          <View style={styles.demoBox}>
            <Text style={styles.demoLabel}>DEMO MODE — no email service connected</Text>
            <Text style={styles.demoCode}>Your code is: {code}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>6-digit code</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="rgba(62,50,38,0.4)"
              value={input}
              onChangeText={setInput}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{loading ? "Verifying…" : "Verify"}</Text>
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
  subtitle: { color: "rgba(62,50,38,0.7)", fontSize: 15, lineHeight: 21, marginBottom: 20, maxWidth: 320 },
  demoBox: {
    backgroundColor: "rgba(212,162,76,0.15)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  demoLabel: { color: colors.mustard, fontSize: 11, fontWeight: "700", marginBottom: 4 },
  demoCode: { color: colors.charcoal, fontSize: 18, fontWeight: "800", letterSpacing: 2 },
  field: { marginBottom: 18 },
  label: { color: colors.charcoal, fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    letterSpacing: 4,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.12)",
    textAlign: "center",
  },
  primaryButton: { marginTop: 12, backgroundColor: colors.clay, borderRadius: 28, paddingVertical: 16, alignItems: "center" },
  primaryButtonText: { color: colors.ivory, fontSize: 16, fontWeight: "700" },
});
