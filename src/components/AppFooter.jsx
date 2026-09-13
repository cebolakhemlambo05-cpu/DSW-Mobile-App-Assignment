import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme/theme";

export default function AppFooter({ onPrivacy, onAbout, dark = false }) {
  return (
    <View style={[styles.footer, dark && styles.darkFooter]}>
      <Text style={[styles.copy, dark && styles.darkText]}>ALL-IN-ONE-PLANNER</Text>
      <Text style={[styles.description, dark && styles.darkText]}>
        Budget-first South Africa travel planning for attractions, accommodation, activities, and day plans.
      </Text>
      <View style={styles.linksRow}>
        <Pressable onPress={onPrivacy} accessibilityRole="link" hitSlop={8} style={styles.linkButton}>
          <Text style={[styles.link, dark && styles.darkText]}>Privacy & data</Text>
        </Pressable>
        <Text style={[styles.separator, dark && styles.darkText]}>|</Text>
        <Pressable onPress={onAbout} accessibilityRole="link" hitSlop={8} style={styles.linkButton}>
          <Text style={[styles.link, dark && styles.darkText]}>About</Text>
        </Pressable>
      </View>
      <Text style={[styles.copy, dark && styles.darkText]}>Built 20 September 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: "center", gap: 7, paddingHorizontal: 24, paddingVertical: 18, backgroundColor: colors.ivory },
  darkFooter: { backgroundColor: "rgba(62,50,38,0.2)" },
  copy: { fontSize: 10, color: colors.charcoal, opacity: 0.5, textAlign: "center" },
  description: { maxWidth: 420, fontSize: 11, lineHeight: 16, color: colors.charcoal, opacity: 0.62, textAlign: "center" },
  linksRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkButton: { minHeight: 28, justifyContent: "center" },
  link: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.savanna, textDecorationLine: "underline" },
  separator: { fontSize: 11, color: colors.charcoal, opacity: 0.35 },
  darkText: { color: colors.ivory },
});
