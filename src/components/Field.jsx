import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";

export default function Field({ label, error, style, ...props }) {
  return (
    <View style={[styles.wrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor="rgba(62,50,38,0.42)"
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.charcoal,
    opacity: 0.72,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.12)",
    color: colors.charcoal,
    fontFamily: fonts.body,
  },
  inputError: { borderColor: colors.terra },
  error: { fontSize: 11, color: colors.terra },
});
