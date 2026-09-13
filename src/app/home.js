import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";
import { attractions } from "../data/attractions";

export default function HomeScreen() {
  const { name } = useLocalSearchParams();
  const [query, setQuery] = useState("");

  const filtered = attractions.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.blurb.toLowerCase().includes(q)
    );
  });

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {name || "there"} 👋</Text>
            <Text style={styles.headerSubtitle}>Where to next in South Africa?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search by vibe — "wildlife", "mountains"...'
            placeholderTextColor="rgba(62,50,38,0.45)"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Day Plan quick link */}
        <TouchableOpacity
          style={styles.dayPlanCard}
          activeOpacity={0.85}
          onPress={() => router.push("/day-plan")}
        >
          <View>
            <Text style={styles.dayPlanLabel}>MY DAY PLAN</Text>
            <Text style={styles.dayPlanText}>See your stays & activities</Text>
          </View>
          <Text style={styles.dayPlanArrow}>→</Text>
        </TouchableOpacity>

        {/* Results */}
        <Text style={styles.sectionTitle}>
          {filtered.length} attraction{filtered.length !== 1 ? "s" : ""}
        </Text>

        {filtered.length === 0 && (
          <Text style={styles.empty}>No matches — try a different search.</Text>
        )}

        <View style={styles.list}>
          {filtered.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/attraction/${a.id}`)}
            >
              <Image source={{ uri: a.image }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.cardCategory}>{a.category}</Text>
                <Text style={styles.cardTitle}>{a.name}</Text>
                <Text style={styles.cardBlurb}>{a.blurb}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  greeting: { fontSize: 24, fontWeight: "800", color: colors.charcoal },
  headerSubtitle: { fontSize: 13, color: "rgba(62,50,38,0.6)", marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.1)",
  },
  searchSection: { paddingHorizontal: 24, marginBottom: 16 },
  searchInput: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.1)",
  },
  dayPlanCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.charcoal,
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  dayPlanLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(250,246,239,0.6)",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  dayPlanText: { fontSize: 15, fontWeight: "700", color: colors.ivory },
  dayPlanArrow: { fontSize: 20, color: colors.mustard },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(62,50,38,0.6)",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  empty: { color: "rgba(62,50,38,0.5)", textAlign: "center", marginTop: 20 },
  list: { paddingHorizontal: 24, gap: 14 },
  card: { flexDirection: "row", backgroundColor: colors.ivory, borderRadius: 16, overflow: "hidden" },
  cardImage: { width: 110, height: 110 },
  cardBody: { flex: 1, padding: 14, justifyContent: "center" },
  cardCategory: { color: colors.skyBlue, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  cardTitle: { color: colors.charcoal, fontSize: 16, fontWeight: "700", marginTop: 4 },
  cardBlurb: { color: "rgba(62,50,38,0.65)", fontSize: 12, marginTop: 4, lineHeight: 16 },
});
