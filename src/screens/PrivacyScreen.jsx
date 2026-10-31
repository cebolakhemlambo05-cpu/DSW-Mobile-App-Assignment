import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack, IconShield } from "../components/Icons";
import AppFooter from "../components/AppFooter";
import BrandLogo from "../components/BrandLogo";

const sections = [
  {
    title: "Account information",
    items: [
      "Your name, email address, nationality and optional profile photo are stored with your account in Firebase Cloud Firestore.",
      "Passwords are stored as scrypt hashes. Sign-in and registration also use a one-time email code; the code is stored as a hash and expires after 10 minutes.",
      "Signed-in account requests use a server session that expires after 12 hours. Password resets and account deletion revoke active sessions.",
    ],
  },
  {
    title: "Your saved plans",
    items: [
      "The Day Plan can contain attractions, activities, check-in and check-out dates, group size, room sharing and room count.",
      "Reservation requests can include the guest email, property, dates, party size, booking and payment references, selected payment method and cost breakdown. The app does not collect card numbers, bank details or payment credentials.",
      "Booking requests and selected payment preferences are saved to your account. Hotelbeds confirmation and payment are handled separately and are not completed by this app.",
    ],
  },
  {
    title: "Information on this device",
    items: [
      "The app keeps a local account and plan cache, active profile, and unsynced changes in device storage so planning can continue offline. AsyncStorage data is not encrypted by this app.",
      "On iOS and Android, the sign-in session token and offline password verifier use the operating system secure storage. In the web app they use browser storage, which has different protections.",
      "The offline verifier is a salted PBKDF2 hash; the app does not save the plain-text password for offline sign-in.",
    ],
  },
  {
    title: "External services",
    items: [
      "When you use Travel Lens, the landmark image and a catalogue of South African attractions are sent from the app through our API to OpenAI for identification. Do not submit images containing information you do not want processed by that service.",
      "Hotelbeds receives the destination coordinates, stay dates, room count and guest count for accommodation searches. If Google Places photo lookup is configured for another hotel provider, the API may also send property names and locations to Google Places to find matching photos.",
      "Attraction searches send your search terms to OpenStreetMap's Nominatim service. Weather forecasts send attraction coordinates to Open-Meteo. Foreign-currency accommodation prices may use Frankfurter exchange-rate data. The app uses your device location only after you request distance sorting; it calculates approximate distances on your device and does not send your location to our API.",
      "When a booking request email is sent, EmailJS receives the recipient, guest and property details, dates, room and activity totals, references and preferred payment method so it can deliver the email.",
      "These providers process requests under their own terms and privacy policies. The app's backend API keys are kept server-side.",
    ],
  },
  {
    title: "Your choices and deletion",
    items: [
      "You can edit your profile, remove individual plan items, clear your Day Plan or delete your account from Profile.",
      "The Profile activity timeline shows account registration, profile updates and Day Plan saves recorded by the server. It does not record every search, page view or button tap, and older actions from before activity tracking began may not appear.",
      "Account deletion removes the Firestore account, saved plan, registration challenge, active sessions and this device's cached account data. Audit history may retain the account email and action metadata, including the deletion event; backup retention is controlled by the Firebase project.",
    ],
  },
];

function InfoSection({ title, items }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.bullet} />
          <Text style={styles.body}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PrivacyScreen({ onBack, onPrivacy, onAbout, onManageAccount }) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityLabel="Back">
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={styles.topLogo}><BrandLogo circle /></View>
        <Text style={styles.eyebrow}>YOUR INFORMATION</Text>
        <Text style={styles.title}>Privacy & data</Text>
        <Text style={styles.subtitle}>What the planner stores, where it goes, and how to manage it.</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}><IconShield color={colors.savanna} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Session protected account access</Text>
            <Text style={styles.securityBody}>Profile and plan endpoints require a signed-in session. Sessions expire after 12 hours.</Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Connection security</Text>
          <Text style={styles.noticeBody}>The production app connects to its configured API over HTTPS. Local development may use HTTP, which does not encrypt traffic; use test data with local development servers.</Text>
        </View>

        {sections.map((section) => <InfoSection key={section.title} {...section} />)}

        <Pressable onPress={onManageAccount} disabled={!onManageAccount} style={[styles.manageButton, !onManageAccount && styles.manageButtonDisabled]}>
          <Text style={styles.manageButtonText}>{onManageAccount ? "Manage account & deletion" : "Sign in to manage account data"}</Text>
        </Pressable>
      </ScrollView>
      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 23, position: "relative" },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  topLogo: { position: "absolute", top: 12, right: 20 },
  eyebrow: { color: colors.sand, opacity: 0.62, fontSize: 9, fontFamily: fonts.bodySemiBold, letterSpacing: 1.5 },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory, marginTop: 3 },
  subtitle: { color: colors.sand, opacity: 0.76, marginTop: 5, fontSize: 12, lineHeight: 18, maxWidth: 330 },
  content: { padding: 18, gap: 12, paddingBottom: 32 },
  securityCard: { flexDirection: "row", gap: 12, padding: 15, borderRadius: 15, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "#D8DFD3" },
  securityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#E7EBDD" },
  securityTitle: { color: colors.savanna, fontSize: 13, fontFamily: fonts.bodySemiBold },
  securityBody: { color: colors.charcoal, opacity: 0.7, fontSize: 11, lineHeight: 16, marginTop: 4 },
  noticeCard: { padding: 15, borderRadius: 15, backgroundColor: "#FFF2DB", borderWidth: 1, borderColor: "#EBD8B1" },
  noticeTitle: { color: "#76531A", fontFamily: fonts.bodySemiBold, fontSize: 12 },
  noticeBody: { color: colors.charcoal, opacity: 0.8, fontSize: 11, lineHeight: 17, marginTop: 5 },
  section: { padding: 15, borderRadius: 15, backgroundColor: colors.ivory, gap: 11 },
  sectionTitle: { color: colors.savanna, fontSize: 14, fontFamily: fonts.bodyBold },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, backgroundColor: colors.terra },
  body: { flex: 1, fontSize: 11, lineHeight: 17, color: colors.charcoal, opacity: 0.76 },
  manageButton: { minHeight: 46, paddingHorizontal: 15, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.terra },
  manageButtonDisabled: { backgroundColor: colors.savanna },
  manageButtonText: { color: colors.ivory, fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
