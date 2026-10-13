import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";

export default function BrandLogo({ dark = false, compact = false }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, dark && { backgroundColor: colors.terra }]}>
        <Text style={styles.markText}>A</Text>
      </View>
      {!compact && (
        <View>
          <Text style={[styles.kicker, dark && styles.darkSub]}>All-in-One</Text>
          <Text style={[styles.name, dark && styles.darkText]}>Travel Planner</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.savanna,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { color: colors.ivory, fontFamily: fonts.display, fontSize: 18 },
  kicker: {
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.terra,
    fontFamily: fonts.bodyBold,
  },
  name: { color: colors.charcoal, fontFamily: fonts.display, fontSize: 15 },
  darkSub: { color: "rgba(250,246,239,0.68)" },
  darkText: { color: colors.ivory },
});
