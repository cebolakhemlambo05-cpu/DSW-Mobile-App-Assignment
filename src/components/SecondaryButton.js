import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function SecondaryButton({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.savanna,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: colors.savanna, fontSize: 16, fontWeight: "700" },
});
