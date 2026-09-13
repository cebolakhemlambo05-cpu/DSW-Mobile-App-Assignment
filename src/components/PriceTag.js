import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function PriceTag({ amount, unit, size = "medium" }) {
  const isFree = amount === 0;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.amount, size === "large" && styles.large]}>
        {isFree ? "Free" : `R${amount.toLocaleString()}`}
      </Text>
      {unit && !isFree ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  amount: { color: colors.charcoal, fontSize: 16, fontWeight: "800" },
  large: { fontSize: 22 },
  unit: { color: "rgba(62,50,38,0.5)", fontSize: 12 },
});
