import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";

export default function DayPlanScreen() {
  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Day Plan</Text>
        <Text style={styles.subtitle}>
          This screen will total up your chosen stay + activities.
          {"\n\n"}Next step: wire "Add to Day Plan" buttons on the
          attraction and accommodation screens into a shared cart so
          this page can show real selections and a running total.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.primaryButtonText}>Back to Search</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backLink: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  title: { color: colors.charcoal, fontSize: 26, fontWeight: "800", marginTop: 16 },
  subtitle: {
    color: "rgba(62,50,38,0.7)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: colors.clay,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.ivory, fontSize: 15, fontWeight: "700" },
});
