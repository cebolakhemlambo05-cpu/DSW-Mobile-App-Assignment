import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";

export default function Badge({ children, color = "terra", icon }) {
  const bg = color === "sky" ? colors.sky : color === "savanna" ? colors.savanna : colors.terra;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon}
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  text: { color: colors.ivory, fontSize: 10, fontFamily: fonts.bodyBold },
});
