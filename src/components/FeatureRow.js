import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function FeatureRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {value ? <Text style={styles.value}>{value}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 16 },
  label: { color: colors.charcoal, fontSize: 14, fontWeight: "600" },
  value: { color: "rgba(62,50,38,0.6)", fontSize: 12, marginTop: 1 },
});
