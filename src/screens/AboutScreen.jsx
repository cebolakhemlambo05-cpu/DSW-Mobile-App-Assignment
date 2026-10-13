import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "./PrivacyScreen";
import { colors, fonts } from "../theme/theme";

export default function AboutScreen({ onBack, onPrivacy }) {
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="About" onBack={onBack} rightLabel="Privacy" onRight={onPrivacy} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>All-in-One Travel Planner</Text>
        <Text style={styles.body}>A React Native and Expo travel planning app for discovering attractions, planning days, checking weather, managing budgets and coordinating group travel.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 20, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.charcoal },
  body: { color: colors.charcoal, opacity: 0.72, lineHeight: 22 },
});
