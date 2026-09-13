import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function PeakPricingBadge({ label = "Price doubles in December" }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212,162,76,0.15)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  icon: { fontSize: 12 },
  text: { color: colors.mustard, fontSize: 11, fontWeight: "700" },
});
