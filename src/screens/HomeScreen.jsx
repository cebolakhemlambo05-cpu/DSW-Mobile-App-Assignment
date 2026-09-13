"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const theme_1 = require("../theme/theme");
const useAttractions_1 = require("../hooks/useAttractions");
const Icons_1 = require("../components/Icons");
const BudgetSlider_1 = __importDefault(require("../components/BudgetSlider"));
const AttractionCard_1 = __importDefault(require("../components/AttractionCard"));
const BrandLogo_1 = __importDefault(require("../components/BrandLogo"));
const CATEGORIES = ["All", "Wildlife", "Mountains", "City", "Coast"];
function HomeScreen({ onSelect, onViewPlan, planCount, currentUser, onSignOut, onViewProfile, }) {
    const [query, setQuery] = (0, react_1.useState)("");
  const { attractions } = (0, useAttractions_1.useAttractions)(query);
    const [budget, setBudget] = (0, react_1.useState)(2500);
    const [category, setCategory] = (0, react_1.useState)("All");
    const [localOnly, setLocalOnly] = (0, react_1.useState)(false);
    const searchAliases = {
      mountains: ["mountain", "mountains", "hiking", "hike", "peak"],
      wildlife: ["wildlife", "safari", "animal", "animals", "game", "zoo"],
      coast: ["coast", "coastal", "beach", "ocean", "sea"],
      city: ["city", "urban", "culture", "museum", "gallery"],
    };
    const filtered = (0, react_1.useMemo)(() => {
        return attractions.filter((a) => {
            if (localOnly && !a.localFav)
                return false;
        const searchableText = [a.name, a.location, a.category, a.description].join(" ").toLowerCase();
        if (category !== "All" && !(searchAliases[category.toLowerCase()] || [category.toLowerCase()]).some((term) => searchableText.includes(term)))
                return false;
            if (query) {
                const q = query.toLowerCase();
          const terms = searchAliases[q] || [q];
          if (!terms.some((term) => searchableText.includes(term)))
            return false;
            }
        const prices = (a.accommodations || []).map((ac) => ac.pricePerNight).filter((price) => typeof price === "number");
        return prices.length === 0 || Math.min(...prices) <= budget;
        });
    }, [attractions, query, budget, category, localOnly]);
    return (<react_native_1.View style={styles.screen}>
      <react_native_safe_area_context_1.SafeAreaView edges={["top"]} style={styles.header}>
        <react_native_1.View style={styles.headerTop}>
          <BrandLogo_1.default dark compact />
          <react_native_1.View style={styles.userRow}>
            <react_native_1.Pressable onPress={onViewProfile}>
              <react_native_1.Text style={styles.userGreeting}>
                Hi, <react_native_1.Text style={styles.userName}>{currentUser?.firstName || currentUser}</react_native_1.Text>
              </react_native_1.Text>
            </react_native_1.Pressable>
            <react_native_1.Pressable onPress={onSignOut} style={styles.signOutBtn}>
              <react_native_1.Text style={styles.signOutText}>Sign out</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
        </react_native_1.View>
        <react_native_1.View style={styles.discoverRow}>
          <react_native_1.View>
            <react_native_1.Text style={styles.discoverLabel}>Discover</react_native_1.Text>
            <react_native_1.Text style={styles.discoverTitle}>South Africa</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.Pressable onPress={onViewPlan} style={styles.planBtn}>
            <Icons_1.IconCalendar color={theme_1.colors.ivory}/>
            <react_native_1.Text style={styles.planBtnText}>Day Plan</react_native_1.Text>
            {planCount > 0 && (<react_native_1.View style={styles.planBadge}>
                <react_native_1.Text style={styles.planBadgeText}>{planCount}</react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.Pressable>
        </react_native_1.View>
      </react_native_safe_area_context_1.SafeAreaView>

      <react_native_1.FlatList data={filtered} keyExtractor={(a) => a.id} numColumns={2} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} ListHeaderComponent={<react_native_1.View style={{ gap: 16, marginBottom: 16 }}>
            <react_native_1.View style={styles.searchWrap}>
              <react_native_1.View style={styles.searchIcon}>
                <Icons_1.IconSearch color="rgba(62,50,38,0.4)"/>
              </react_native_1.View>
              <react_native_1.TextInput value={query} onChangeText={setQuery} placeholder='Search by vibe — "wildlife", "mountains", "Cape Town"…' placeholderTextColor="rgba(62,50,38,0.4)" style={styles.searchInput}/>
            </react_native_1.View>

            <BudgetSlider_1.default value={budget} onChange={setBudget} sublabel="Accommodation is filtered to match"/>

            <react_native_1.View style={styles.chipsRow}>
              <react_native_1.FlatList data={CATEGORIES} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(c) => c} ItemSeparatorComponent={() => <react_native_1.View style={{ width: 8 }}/>} renderItem={({ item: cat }) => (<react_native_1.Pressable onPress={() => setCategory(cat)} style={[
                    styles.chip,
                    category === cat ? { backgroundColor: theme_1.colors.savanna } : { backgroundColor: theme_1.colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.15)" },
                ]}>
                    <react_native_1.Text style={[styles.chipText, { color: category === cat ? theme_1.colors.ivory : theme_1.colors.charcoal }]}>{cat}</react_native_1.Text>
                  </react_native_1.Pressable>)} ListFooterComponent={<react_native_1.Pressable onPress={() => setLocalOnly(!localOnly)} style={[
                    styles.localChip,
                    localOnly ? { backgroundColor: theme_1.colors.sky } : { backgroundColor: theme_1.colors.ivory, borderWidth: 1, borderColor: "rgba(122,158,159,0.4)" },
                ]}>
                    <Icons_1.IconGem color={localOnly ? theme_1.colors.ivory : theme_1.colors.sky}/>
                    <react_native_1.Text style={[styles.chipText, { color: localOnly ? theme_1.colors.ivory : theme_1.colors.charcoal, marginLeft: 6 }]}>Local Favs</react_native_1.Text>
                  </react_native_1.Pressable>}/>
            </react_native_1.View>

            <react_native_1.View style={styles.countRow}>
              <react_native_1.Text style={styles.countText}>
                {filtered.length} attraction{filtered.length !== 1 ? "s" : ""} within budget
              </react_native_1.Text>
              {filtered.length === 0 && <react_native_1.Text style={styles.raiseBudget}>Try raising your budget</react_native_1.Text>}
            </react_native_1.View>
          </react_native_1.View>} renderItem={({ item }) => (<react_native_1.View style={{ flex: 1 }}>
            <AttractionCard_1.default attraction={item} budget={budget} onPress={() => onSelect(item)}/>
          </react_native_1.View>)} ListEmptyComponent={<react_native_1.View style={styles.emptyState}>
            <react_native_1.Text style={styles.emptyEmoji}>🌿</react_native_1.Text>
            <react_native_1.Text style={styles.emptyTitle}>No matches found</react_native_1.Text>
            <react_native_1.Text style={styles.emptySubtitle}>Try different keywords or raise your budget</react_native_1.Text>
          </react_native_1.View>}/>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme_1.colors.sand },
    header: { backgroundColor: theme_1.colors.savanna, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
    headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    brandIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: theme_1.colors.terra, alignItems: "center", justifyContent: "center" },
    brandLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,196,0.8)" },
    userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    userGreeting: { fontSize: 11, color: "rgba(232,220,196,0.6)" },
    userName: { fontFamily: theme_1.fonts.bodySemiBold, color: "rgba(232,220,196,0.9)", textTransform: "capitalize" },
    signOutBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
    signOutText: { fontSize: 11, color: "rgba(232,220,196,0.7)" },
    discoverRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    discoverLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.5)" },
    discoverTitle: { fontSize: 20, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory, marginTop: 2 },
    planBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)" },
    planBtnText: { fontSize: 13, fontFamily: theme_1.fonts.bodyMedium, color: theme_1.colors.ivory },
    planBadge: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: theme_1.colors.terra, alignItems: "center", justifyContent: "center" },
    planBadgeText: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
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
        fontFamily: theme_1.fonts.body,
        backgroundColor: theme_1.colors.ivory,
        color: theme_1.colors.charcoal,
    },
    chipsRow: {},
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
    chipText: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold },
    localChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginLeft: 8 },
    countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    countText: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.5 },
    raiseBudget: { fontSize: 11, color: theme_1.colors.terra },
    emptyState: { paddingVertical: 60, alignItems: "center" },
    emptyEmoji: { fontSize: 40, marginBottom: 10 },
    emptyTitle: { fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, fontSize: 15 },
    emptySubtitle: { fontSize: 13, color: theme_1.colors.charcoal, opacity: 0.5, marginTop: 4 },
});
