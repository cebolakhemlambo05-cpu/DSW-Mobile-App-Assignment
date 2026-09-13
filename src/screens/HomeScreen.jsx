import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconSearch, IconCalendar, IconGem, IconHome } from "../components/Icons";
import BudgetSlider from "../components/BudgetSlider";
import AttractionCard from "../components/AttractionCard";
import AppFooter from "../components/AppFooter";
import { ATTRACTIONS } from "../data/attractions";

const CATEGORIES = ["All", ...new Set(ATTRACTIONS.map((attraction) => attraction.category))];

export default function HomeScreen({ onSelect, onViewPlan, planCount, currentUser, onSignOut, onPrivacy, onAbout }) {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(8000);
  const [category, setCategory] = useState("All");
  const [localOnly, setLocalOnly] = useState(false);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ATTRACTIONS.filter((a) => {
      if (localOnly && !a.localFav) return false;
      if (category !== "All" && a.category !== category) return false;
      if (
        normalizedQuery &&
        ![a.name, a.location, a.category, a.description].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      ) {
        return false;
      }
      if (!a.accommodations?.length) return true;

      const cheapest = Math.min(...a.accommodations.map((ac) => ac.pricePerNight));
      return cheapest <= budget;
    });
  }, [query, category, localOnly, budget]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <IconHome />
            </View>
            <Text style={styles.brandLabel}>ALL-IN-ONE-PLANNER</Text>
          </View>
          <View style={styles.userRow}>
            <Text style={styles.userGreeting}>
              <Text>Hi, </Text>
              <Text style={styles.userName}>{currentUser}</Text>
            </Text>
            <Pressable onPress={onSignOut} style={styles.signOutBtn}>
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.discoverRow}>
          <View>
            <Text style={styles.discoverLabel}>Discover</Text>
            <Text style={styles.discoverTitle}>South Africa</Text>
          </View>
          <Pressable onPress={onViewPlan} style={styles.planBtn}>
            <IconCalendar color={colors.ivory} />
            <Text style={styles.planBtnText}>Day Plan</Text>
            {planCount > 0 && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{planCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 16 }}>
            <View style={styles.searchWrap}>
              <View style={styles.searchIcon}>
                <IconSearch color="rgba(62,50,38,0.4)" />
              </View>
              <TextInput
                value={query}
                onChangeText={(value) => setQuery(value.slice(0, 100))}
                maxLength={100}
                placeholder='Search by vibe — "wildlife", "mountains", "Cape Town"…'
                placeholderTextColor="rgba(62,50,38,0.4)"
                style={styles.searchInput}
              />
            </View>

            <BudgetSlider value={budget} onChange={setBudget} sublabel="Accommodation is filtered to match" />

            <View style={styles.chipsRow}>
              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(c) => c}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                renderItem={({ item: cat }) => (
                  <Pressable
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      category === cat
                        ? { backgroundColor: colors.savanna }
                        : { backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.15)" },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: category === cat ? colors.ivory : colors.charcoal }]}>{cat}</Text>
                  </Pressable>
                )}
                ListFooterComponent={
                  <Pressable
                    onPress={() => setLocalOnly(!localOnly)}
                    style={[
                      styles.localChip,
                      localOnly
                        ? { backgroundColor: colors.sky }
                        : { backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(122,158,159,0.4)" },
                    ]}
                  >
                    <IconGem color={localOnly ? colors.ivory : colors.sky} />
                    <Text style={[styles.chipText, { color: localOnly ? colors.ivory : colors.charcoal, marginLeft: 6 }]}>
                      Local Favs
                    </Text>
                  </Pressable>
                }
              />
            </View>

            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {filtered.length} attraction{filtered.length !== 1 ? "s" : ""} within budget
              </Text>
              {filtered.length === 0 && <Text style={styles.raiseBudget}>Try raising your budget</Text>}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <AttractionCard attraction={item} budget={budget} onPress={() => onSelect(item)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>Try different keywords or raise your budget</Text>
          </View>
        }
      />
      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: colors.terra, alignItems: "center", justifyContent: "center" },
  brandLabel: { fontSize: 10, fontFamily: fonts.bodyBold, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,196,0.8)" },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  userGreeting: { fontSize: 11, color: "rgba(232,220,196,0.6)" },
  userName: { fontFamily: fonts.bodySemiBold, color: "rgba(232,220,196,0.9)", textTransform: "capitalize" },
  signOutBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  signOutText: { fontSize: 11, color: "rgba(232,220,196,0.7)" },
  discoverRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  discoverLabel: { fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.5)" },
  discoverTitle: { fontSize: 20, fontFamily: fonts.display, color: colors.ivory, marginTop: 2 },
  planBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)" },
  planBtnText: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.ivory },
  planBadge: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.terra, alignItems: "center", justifyContent: "center" },
  planBadgeText: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.ivory },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  searchWrap: { position: "relative", justifyContent: "center" },
  searchIcon: { position: "absolute", left: 16, zIndex: 1 },
  searchInput: {
    width: "100%",
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 14,
    borderRadius: 18,
    fontSize: 14,
    fontFamily: fonts.body,
    backgroundColor: colors.ivory,
    color: colors.charcoal,
  },
  chipsRow: {},
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { fontSize: 12, fontFamily: fonts.bodySemiBold },
  localChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginLeft: 8 },
  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countText: { fontSize: 11, color: colors.charcoal, opacity: 0.5 },
  raiseBudget: { fontSize: 11, color: colors.terra },
  loadingText: { fontSize: 12, color: colors.charcoal, opacity: 0.6 },
  errorText: { fontSize: 12, color: colors.terra },
  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.bodySemiBold, color: colors.charcoal, fontSize: 15 },
  emptySubtitle: { fontSize: 13, color: colors.charcoal, opacity: 0.5, marginTop: 4 },
});
