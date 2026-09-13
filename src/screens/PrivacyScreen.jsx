import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";
import AppFooter from "../components/AppFooter";

export default function PrivacyScreen({ onBack, onPrivacy, onAbout }) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}><IconBack color={colors.sand} /></Pressable>
        <Text style={styles.title}>Privacy & data</Text>
        <Text style={styles.subtitle}>Clear information about how this planner handles data.</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>What we store</Text>
        <Text style={styles.body}>Your account name, email address, nationality, and a securely hashed password are stored by the app backend in its JSON data file. Passwords are never stored as plain text.</Text>
        <Text style={styles.heading}>What we use</Text>
        <Text style={styles.body}>Your account lets you sign in again and use your travel plans. Attraction and accommodation searches use destination coordinates and search preferences to request results from configured providers.</Text>
        <Text style={styles.heading}>Your responsibility</Text>
        <Text style={styles.body}>The JSON store is suitable for local development. Before production use, move accounts to a managed database, add sessions, rate limiting, email verification, and encrypted backups.</Text>
      </ScrollView>
      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 26 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 },
  content: { padding: 24, gap: 12 },
  heading: { fontSize: 15, fontFamily: fonts.bodyBold, color: colors.savanna, marginTop: 10 },
  body: { fontSize: 14, lineHeight: 21, color: colors.charcoal, opacity: 0.75 },
});
