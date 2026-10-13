import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";

const POLICY_SECTIONS = [
  {
    icon: "i",
    title: "Information we collect",
    body: "The app may collect account details you enter, such as your name, email address, nationality and password. It also stores trip information you choose to save, including day plans, accommodation selections, activities, packing progress, expense groups and eco-travel choices.",
  },
  {
    icon: "u",
    title: "How we use personal information",
    body: "Your information is used to create and protect your account, sign you in, save travel plans, calculate trip budgets, manage group expenses, generate packing suggestions and show your saved planner data when you return.",
  },
  {
    icon: "k",
    title: "Account security and authentication",
    body: "Passwords are stored as hashes by the backend. Login and registration use one-time codes sent by email when EmailJS is configured. The app also signs authenticated users out after inactivity. Codes and reset tokens expire and are checked by the backend.",
  },
  {
    icon: "c",
    title: "Location and camera permissions",
    body: "Weather and destination features use attraction coordinates saved in the plan or returned by attraction APIs. Travel Lens requests camera permission only when you use that feature. If you choose to capture a landmark image, the image may be sent to a recognition service for identification.",
  },
  {
    icon: "$",
    title: "Travel plans and expense data",
    body: "Day plans, packing checklists, group expenses, settlement status and eco progress are stored against your app account in the backend data store. Expense calculations are planning tools and should be checked before making real payments.",
  },
  {
    icon: "a",
    title: "Third-party APIs and services",
    body: "The app can use Google Places for attractions and nearby lodging, Open-Meteo for weather forecasts, EmailJS for account emails and Google Cloud Vision for Travel Lens recognition when configured. These services receive only the data needed for the selected feature.",
  },
  {
    icon: "s",
    title: "Data storage and protection",
    body: "The project stores app data through the configured backend data file or service. API keys should be kept in environment files and not hardcoded in the mobile app. The app does not claim bank-grade security or a fixed retention period.",
  },
  {
    icon: "p",
    title: "User privacy choices",
    body: "You can choose not to grant camera permission, avoid Travel Lens image recognition, edit or clear saved travel plans, and delete your account from the profile screen. Non-essential feature data is created only when you use those tools.",
  },
  {
    icon: "@",
    title: "Contact information",
    body: "For questions about this project or your saved app data, contact the All-in-One Travel Planner administrator or the project maintainer responsible for your deployment.",
  },
];

export default function PrivacyScreen({ onBack, onAbout }) {
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Privacy Policy" onBack={onBack} rightLabel="About" onRight={onAbout} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>All-in-One Travel Planner</Text>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.intro}>
            This page explains how the app handles account, travel planning,
            camera and third-party service data based on the features currently
            implemented in this project.
          </Text>
        </View>

        <View style={styles.grid}>
          {POLICY_SECTIONS.map((section) => (
            <View key={section.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Text style={styles.iconText}>{section.icon}</Text>
                </View>
                <Text style={styles.cardTitle}>{section.title}</Text>
              </View>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Header({ title, onBack, rightLabel, onRight }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.back}>‹</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightLabel ? (
        <Pressable onPress={onRight}>
          <Text style={styles.right}>{rightLabel}</Text>
        </Pressable>
      ) : (
        <View style={{ width: 48 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: colors.savanna,
  },
  backButton: {
    width: 48,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  back: { color: colors.ivory, fontSize: 30, lineHeight: 32 },
  right: { color: colors.ivory, fontFamily: fonts.bodySemiBold },
  headerTitle: { color: colors.ivory, fontFamily: fonts.display, fontSize: 22 },
  content: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    padding: 18,
    paddingBottom: 36,
    gap: 16,
  },
  hero: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: colors.savanna,
    borderWidth: 1,
    borderColor: "rgba(250,246,239,0.16)",
  },
  eyebrow: {
    color: "rgba(250,246,239,0.68)",
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ivory,
  },
  intro: {
    color: "rgba(250,246,239,0.78)",
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 720,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    flexGrow: 1,
    flexBasis: 280,
    minWidth: 0,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "rgba(201,123,74,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: colors.terra, fontFamily: fonts.bodyBold, fontSize: 14 },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    color: colors.charcoal,
    fontSize: 15,
  },
  body: { color: colors.charcoal, opacity: 0.72, lineHeight: 21, fontSize: 13 },
});
