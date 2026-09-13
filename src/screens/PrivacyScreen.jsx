import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";
import AppFooter from "../components/AppFooter";
import BrandLogo from '../components/BrandLogo';

export default function PrivacyScreen({ onBack, onPrivacy, onAbout }) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={styles.topLogo}>
          <BrandLogo circle />
        </View>
        <Text style={styles.title}>Privacy & data</Text>
        <Text style={styles.subtitle}>
          Clear information about how this planner handles data.
        </Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>What we store</Text>
        <Text style={styles.body}>
          Your first name, surname, email address, nationality, securely hashed
          password, account date, and saved Day Plan are stored by the backend
          in its JSON data file. Passwords are never stored as plain text.
        </Text>
        <Text style={styles.heading}>How we use it</Text>
        <Text style={styles.body}>
          Account details support sign-in and your profile. Your Day Plan is
          saved so it remains available after sign-out. Attraction,
          accommodation, and activity searches use destination and budget
          preferences to return planning results.
        </Text>
        <Text style={styles.heading}>Your control</Text>
        <Text style={styles.body}>
          You can update your profile, remove saved plan items, clear your Day
          Plan, or delete your account. Account deletion removes the user
          record, saved plan, and pending registration data from the JSON store.
        </Text>
        <Text style={styles.heading}>Development storage</Text>
        <Text style={styles.body}>
          This JSON store is intended for local development. Before production
          use, add managed database storage, authenticated sessions, rate
          limiting, encrypted backups, and formal retention controls.
        </Text>
      </ScrollView>
      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: {
    backgroundColor: colors.savanna,
    paddingHorizontal: 20,
    paddingBottom: 26,
    position: 'relative',
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topLogo: { position: 'absolute', top: 12, right: 20 },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 },
  content: { padding: 24, gap: 12 },
  heading: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.savanna,
    marginTop: 10,
  },
  body: { fontSize: 14, lineHeight: 21, color: colors.charcoal, opacity: 0.75 },
});
