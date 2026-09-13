import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import {
  IconBack,
  IconCalendar,
  IconShield,
  IconGem,
  IconHome,
} from "../components/Icons";
import { fmt } from "../utils/format";

export default function ProfileScreen({ currentUser, plan, budget = 2500, onBack, onSignOut }) {
  const initial = (currentUser || "G").charAt(0).toUpperCase();
  const plannedAttractions = plan.length;
  const plannedActivities = plan.reduce(
    (s, e) => s + e.activities.length,
    0
  );
  const nights = plan.filter((e) => e.accommodation).length;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Your account</Text>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{currentUser || "Guest Traveller"}</Text>
          <Text style={styles.subtitle}>South Africa Explorer</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <IconCalendar color={colors.savanna} size={16} />
            <Text style={styles.statValue}>{plannedAttractions}</Text>
            <Text style={styles.statLabel}>Attractions</Text>
          </View>
          <View style={styles.statBox}>
            <IconGem color={colors.sky} size={16} />
            <Text style={styles.statValue}>{plannedActivities}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statBox}>
            <IconHome color={colors.terra} size={16} />
            <Text style={styles.statValue}>{nights}</Text>
            <Text style={styles.statLabel}>Stays</Text>
          </View>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Daily Budget</Text>
            <Text style={styles.budgetValue}>{fmt(budget)}</Text>
          </View>
          <Text style={styles.budgetNote}>
            Adjust it anytime from the Budget or Home screen.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            All-in-One Planner helps budget-conscious travellers explore South
            Africa. Prices first, surprises never.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Privacy & Terms</Text>
        <View style={styles.card}>
          <View style={styles.shieldRow}>
            <IconShield color={colors.savanna} size={16} />
            <Text style={styles.cardTitle}>Your data stays on your device</Text>
          </View>
          <Text style={styles.cardText}>
            By using this app you agree to our Terms of Service and Privacy
            Policy. We never sell your data.
          </Text>
        </View>

        <Pressable onPress={onSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.footer}>Prices first, surprises never.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.savanna,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(232,220,196,0.6)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.ivory,
  },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  avatarBlock: { alignItems: "center", marginTop: 12, marginBottom: 4 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.savanna,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.savanna,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarText: {
    color: colors.ivory,
    fontSize: 36,
    fontFamily: fonts.displayBold,
  },
  name: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.charcoal,
    marginTop: 12,
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 12,
    color: colors.charcoal,
    opacity: 0.55,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.charcoal,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.charcoal,
    opacity: 0.5,
  },
  budgetCard: {
    backgroundColor: colors.savanna,
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  budgetLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "rgba(232,220,196,0.7)",
  },
  budgetValue: {
    fontSize: 22,
    fontFamily: fonts.display,
    color: colors.ivory,
  },
  budgetNote: {
    fontSize: 11,
    color: "rgba(232,220,196,0.55)",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.charcoal,
    opacity: 0.5,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.charcoal,
  },
  cardText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.charcoal,
    opacity: 0.7,
  },
  shieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signOutBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.savanna,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.savanna,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: colors.charcoal,
    opacity: 0.4,
    fontStyle: "italic",
    marginTop: 8,
  },
});