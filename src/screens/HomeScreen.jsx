import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { useAttractions } from "../hooks/useAttractions";
import AttractionCard from "../components/AttractionCard";
import BudgetSlider from "../components/BudgetSlider";
import BrandLogo from "../components/BrandLogo";
import {
  IconBag,
  IconCalendar,
  IconCamera,
  IconLeaf,
  IconSearch,
  IconWallet,
} from "../components/Icons";

const CATEGORIES = ["All", "Wildlife", "Mountains", "City", "Coast"];
const HOME_BACKGROUND =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=1600&fit=crop&auto=format";

export default function HomeScreen({
  onSelect,
  onViewPlan,
  planCount,
  currentUser,
  onSignOut,
  onViewProfile,
  onBack,
  onTravelLens,
  onExpenses,
  onPacking,
  onEco,
}) {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(2500);
  const [category, setCategory] = useState("All");
  const { attractions } = useAttractions(query);

  const filtered = useMemo(() => {
    return attractions.filter((attraction) => {
      const text = [
        attraction.name,
        attraction.location,
        attraction.category,
        attraction.description,
      ]
        .join(" ")
        .toLowerCase();
      if (category !== "All" && !text.includes(category.toLowerCase())) return false;
      const prices = (attraction.accommodations || [])
        .map((stay) => stay.pricePerNight)
        .filter((price) => Number.isFinite(Number(price)));
      const cheapest = prices.length ? Math.min(...prices) : 0;
      return !cheapest || cheapest <= budget;
    });
  }, [attractions, budget, category]);

  const submitSearch = () => {
    setQuery(queryInput.trim());
    setCategory("All");
    Keyboard.dismiss();
  };

  const featureCards = [
    { title: "Travel Lens", subtitle: "Camera landmark lookup", icon: IconCamera, action: onTravelLens },
    { title: "Expenses", subtitle: "Split group trip costs", icon: IconWallet, action: onExpenses },
    { title: "Packing", subtitle: "Weather-aware checklist", icon: IconBag, action: onPacking },
    { title: "Eco", subtitle: "Compare transport impact", icon: IconLeaf, action: onEco },
  ];

  return (
    <View style={styles.screen}>
      <Image pointerEvents="none" source={{ uri: HOME_BACKGROUND }} style={styles.backgroundImage} />
      <View pointerEvents="none" style={styles.backgroundVeil} />
      <SafeAreaView edges={["top"]} style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={onBack} style={styles.roundBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <BrandLogo dark />
          <View style={styles.headerActions}>
            <Pressable onPress={onViewProfile}>
              <Text style={styles.userText}>Hi, {currentUser?.firstName || "Traveller"}</Text>
            </Pressable>
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
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 16 }}>
            <View style={styles.searchWrap}>
              <View style={styles.searchField}>
                <IconSearch color="rgba(62,50,38,0.42)" />
                <TextInput
                  value={queryInput}
                  onChangeText={setQueryInput}
                  onSubmitEditing={submitSearch}
                  returnKeyType="search"
                  placeholder='Search "wildlife", "Cape Town"...'
                  placeholderTextColor="rgba(62,50,38,0.42)"
                  style={styles.searchInput}
                />
              </View>
              <Pressable onPress={submitSearch} style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>Search</Text>
              </Pressable>
            </View>

            <View style={styles.featureGrid}>
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Pressable key={item.title} onPress={item.action} style={styles.featureCard}>
                    <Icon color={colors.terra} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureSub}>{item.subtitle}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <BudgetSlider value={budget} onChange={setBudget} sublabel="Filters stays by nightly estimate" />

            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setCategory(item)}
                  style={[styles.chip, category === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              )}
            />
            <Text style={styles.countText}>{filtered.length} attraction{filtered.length === 1 ? "" : "s"} found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <AttractionCard attraction={item} budget={budget} onPress={() => onSelect(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  backgroundImage: { ...StyleSheet.absoluteFillObject, opacity: 0.16 },
  backgroundVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(232,220,196,0.86)" },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 18, paddingBottom: 14 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  backText: { color: colors.ivory, fontSize: 28, lineHeight: 30 },
  headerActions: { alignItems: "flex-end", gap: 5 },
  userText: { color: "rgba(250,246,239,0.8)", fontFamily: fonts.bodySemiBold, fontSize: 11 },
  signOutBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.11)" },
  signOutText: { color: colors.ivory, fontSize: 11 },
  discoverRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  discoverLabel: { color: "rgba(250,246,239,0.58)", fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontFamily: fonts.bodyBold },
  discoverTitle: { color: colors.ivory, fontFamily: fonts.display, fontSize: 23 },
  planBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.13)" },
  planBtnText: { color: colors.ivory, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  planBadge: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.terra, alignItems: "center", justifyContent: "center" },
  planBadgeText: { color: colors.ivory, fontSize: 10, fontFamily: fonts.bodyBold },
  listContent: { padding: 16, paddingBottom: 34 },
  searchWrap: { flexDirection: "row", gap: 10 },
  searchField: { flex: 1, minHeight: 50, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.ivory },
  searchInput: { flex: 1, fontFamily: fonts.body, color: colors.charcoal },
  searchBtn: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.terra },
  searchBtnText: { color: colors.ivory, fontFamily: fonts.bodyBold, fontSize: 12 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: { width: "48.5%", minHeight: 76, flexDirection: "row", alignItems: "center", gap: 9, padding: 12, borderRadius: 16, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.08)" },
  featureTitle: { color: colors.charcoal, fontFamily: fonts.bodyBold, fontSize: 13 },
  featureSub: { color: colors.charcoal, opacity: 0.52, fontSize: 10, marginTop: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.12)" },
  chipActive: { backgroundColor: colors.savanna, borderColor: colors.savanna },
  chipText: { color: colors.charcoal, fontSize: 12, fontFamily: fonts.bodySemiBold },
  chipTextActive: { color: colors.ivory },
  countText: { color: colors.charcoal, opacity: 0.56, fontSize: 11 },
});
