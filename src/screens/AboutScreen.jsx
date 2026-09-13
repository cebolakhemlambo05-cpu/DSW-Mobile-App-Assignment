import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack, IconHome } from "../components/Icons";
import AppFooter from "../components/AppFooter";

export default function AboutScreen({ onBack, onPrivacy, onAbout }) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={styles.brandIcon}><IconHome /></View>
        <Text style={styles.title}>About All-In-One-Planner</Text>
        <Text style={styles.subtitle}>Thoughtful travel planning for South Africa.</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Plan with clarity</Text>
        <Text style={styles.body}>
          All-In-One-Planner brings attractions, accommodation, activities, budgets, and day plans into one calm planning space.
        </Text>

        <Text style={styles.heading}>Built around your trip</Text>
        <Text style={styles.body}>
          Compare stays, understand costs before you book, and shape an itinerary that fits your time, group, and budget.
        </Text>

        <Text style={styles.heading}>Version</Text>
        <Text style={styles.body}>All-In-One-Planner 1.0.0</Text>
      </ScrollView>

      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 26 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  brandIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.terra, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 },
  content: { padding: 24, gap: 12 },
  heading: { fontSize: 15, fontFamily: fonts.bodyBold, color: colors.savanna, marginTop: 10 },
  body: { fontSize: 14, lineHeight: 21, color: colors.charcoal, opacity: 0.75 },
});
