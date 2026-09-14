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
exports.default = AttractionScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const format_1 = require("../utils/format");
const Icons_1 = require("../components/Icons");
const Badge_1 = __importDefault(require("../components/Badge"));
const BudgetSlider_1 = __importDefault(require("../components/BudgetSlider"));
const AccomCard_1 = __importDefault(require("../components/AccomCard"));
const ActivityCard_1 = __importDefault(require("../components/ActivityCard"));
const AccomDetailModal_1 = __importDefault(require("../components/AccomDetailModal"));
const api_1 = require("../config/api");
function AttractionScreen({ attraction, onBack, onAddToPlan, existingEntry, }) {
    var _a, _b, _c;
    const [budget, setBudget] = (0, react_1.useState)(2500);
    const [tab, setTab] = (0, react_1.useState)("stays");
    const [selectedAccom, setSelectedAccom] = (0, react_1.useState)((_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.accommodation) === null || _a === void 0 ? void 0 : _a.id);
    const [selectedActivities, setSelectedActivities] = (0, react_1.useState)(new Set((_b = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.activities.map((a) => a.id)) !== null && _b !== void 0 ? _b : []));
    const [showOffline, setShowOffline] = (0, react_1.useState)(false);
    const [viewingAccom, setViewingAccom] = (0, react_1.useState)(null);
    const [accommodations, setAccommodations] = (0, react_1.useState)(attraction.accommodations || []);
    const [lodgingLoading, setLodgingLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
      let active = true;
      if (attraction.accommodations?.length) return undefined;
      setLodgingLoading(true);
      (0, api_1.fetchJson)(`/api/attractions/${encodeURIComponent(attraction.id)}/lodging`)
        .then(({ data }) => { if (active) setAccommodations(data || []); })
        .catch(() => { if (active) setAccommodations([]); })
        .finally(() => { if (active) setLodgingLoading(false); });
      return () => { active = false; };
    }, [attraction]);
    const sortedAccoms = (0, react_1.useMemo)(() => [...accommodations].sort((a, b) => (a.pricePerNight ?? Infinity) - (b.pricePerNight ?? Infinity)), [accommodations]);
    const pricedAccoms = (0, react_1.useMemo)(() => sortedAccoms.filter((a) => a.pricePerNight != null), [sortedAccoms]);
    const filteredAccoms = (0, react_1.useMemo)(() => pricedAccoms.filter((a) => a.pricePerNight <= budget), [pricedAccoms, budget]);
    const unknownPriceAccoms = (0, react_1.useMemo)(() => sortedAccoms.filter((a) => a.pricePerNight == null), [sortedAccoms]);
    const hiddenAccoms = (0, react_1.useMemo)(() => pricedAccoms.filter((a) => a.pricePerNight > budget), [pricedAccoms, budget]);
    const toggleActivity = (id) => {
        setSelectedActivities((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const selectedAccomData = accommodations.find((a) => a.id === selectedAccom);
    const selectedActivityData = attraction.activities.filter((a) => selectedActivities.has(a.id));
    const totalActivityCost = selectedActivityData.reduce((s, a) => s + a.pricePerPerson, 0);
    const totalCost = ((_c = selectedAccomData === null || selectedAccomData === void 0 ? void 0 : selectedAccomData.pricePerNight) !== null && _c !== void 0 ? _c : 0) + totalActivityCost;
    const addToPlan = () => {
        onAddToPlan({
            attractionId: attraction.id,
            attractionName: attraction.name,
            accommodation: selectedAccomData
                ? { id: selectedAccomData.id, name: selectedAccomData.name, price: selectedAccomData.pricePerNight }
                : undefined,
            activities: selectedActivityData.map((a) => ({ id: a.id, name: a.name, price: a.pricePerPerson })),
        });
        onBack();
    };
    return (<react_native_1.View style={styles.screen}>
      <react_native_1.ScrollView showsVerticalScrollIndicator={false}>
        <react_native_1.View style={styles.hero}>
          <react_native_1.Image source={{ uri: attraction.image }} style={styles.heroImage}/>
          <expo_linear_gradient_1.LinearGradient colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]} locations={[0, 0.5, 1]} style={react_native_1.StyleSheet.absoluteFill}/>
          <react_native_1.Pressable onPress={onBack} style={styles.backBtn}>
            <Icons_1.IconBack color="#fff"/>
          </react_native_1.Pressable>
          <react_native_1.Pressable onPress={() => setShowOffline(!showOffline)} style={styles.offlineBtn}>
            <Icons_1.IconOffline color="#fff"/>
            <react_native_1.Text style={styles.offlineText}>{showOffline ? "Saved offline" : "Save offline"}</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.View style={styles.heroTextWrap}>
            {attraction.localFav && (<react_native_1.View style={{ marginBottom: 6, alignSelf: "flex-start" }}>
                <Badge_1.default color="sky" icon={<Icons_1.IconGem />}>Local Favourite</Badge_1.default>
              </react_native_1.View>)}
            <react_native_1.Text style={styles.heroTitle}>{attraction.name}</react_native_1.Text>
            <react_native_1.Text style={styles.heroLocation}>{attraction.location}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>

        <react_native_1.View style={styles.content}>
          <react_native_1.Text style={styles.description}>{attraction.description}</react_native_1.Text>

          <BudgetSlider_1.default value={budget} onChange={setBudget} label="Filter by budget"/>

          <react_native_1.View style={styles.tabRow}>
            {["stays", "activities"].map((t) => (<react_native_1.Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && { backgroundColor: theme_1.colors.savanna }]}>
                <react_native_1.Text style={[styles.tabText, { color: tab === t ? theme_1.colors.ivory : theme_1.colors.charcoal, opacity: tab === t ? 1 : 0.6 }]}>
                  {t === "stays" ? "Where to Sleep" : "What to Do"}
                </react_native_1.Text>
              </react_native_1.Pressable>))}
          </react_native_1.View>

          {tab === "stays" && (<react_native_1.View style={{ gap: 8 }}>
              <react_native_1.Text style={styles.hintText}>
                Sorted cheapest → most expensive · Tap to view details & select · Distance to {attraction.name.split(" ")[0]} gate
              </react_native_1.Text>
              {lodgingLoading && (<react_native_1.View style={{ paddingVertical: 30, alignItems: "center" }}><react_native_1.Text style={styles.emptyHint}>Loading nearby stays...</react_native_1.Text></react_native_1.View>)}
              {!lodgingLoading && filteredAccoms.length === 0 && unknownPriceAccoms.length === 0 && (<react_native_1.View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <react_native_1.Text style={styles.emptyHint}>No stays within R{budget.toLocaleString("en-ZA")} — try raising your budget</react_native_1.Text>
                </react_native_1.View>)}
              {filteredAccoms.map((ac) => (<AccomCard_1.default key={ac.id} accom={ac} selected={selectedAccom === ac.id} onView={() => setViewingAccom(ac)} onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)}/>))}
              {unknownPriceAccoms.length > 0 && (<react_native_1.View style={{ gap: 8 }}><react_native_1.Text style={styles.hintText}>Google provides price levels, not live nightly rates. Check each property for current pricing.</react_native_1.Text>{unknownPriceAccoms.map((ac) => (<AccomCard_1.default key={ac.id} accom={ac} selected={selectedAccom === ac.id} onView={() => setViewingAccom(ac)} onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)}/>))}</react_native_1.View>)}
              {hiddenAccoms.length > 0 && (<react_native_1.Text style={styles.hiddenHint}>{hiddenAccoms.length} stay(s) hidden (over budget)</react_native_1.Text>)}
            </react_native_1.View>)}

          {tab === "activities" && (<react_native_1.View style={{ gap: 8 }}>
              <react_native_1.Text style={styles.hintText}>Tap to add to your day plan · Prices per person</react_native_1.Text>
              {attraction.activities.map((act) => (<ActivityCard_1.default key={act.id} activity={act} selected={selectedActivities.has(act.id)} onToggle={() => toggleActivity(act.id)}/>))}
            </react_native_1.View>)}

          <react_native_1.View style={{ height: 90 }}/>
        </react_native_1.View>
      </react_native_1.ScrollView>

      {(selectedAccomData || selectedActivities.size > 0) && (<react_native_1.View style={styles.stickyCta}>
          <react_native_1.View style={styles.stickyRow}>
            <react_native_1.View>
              <react_native_1.Text style={styles.dayTotalLabel}>Day Total</react_native_1.Text>
              <react_native_1.Text style={styles.dayTotalValue}>{(0, format_1.fmt)(totalCost)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={{ alignItems: "flex-end" }}>
              {selectedAccomData && (<react_native_1.Text style={styles.stickyDetail}>{selectedAccomData.name} · {(0, format_1.fmt)(selectedAccomData.pricePerNight)}</react_native_1.Text>)}
              {selectedActivities.size > 0 && (<react_native_1.Text style={styles.stickyDetail}>
                  {selectedActivities.size} activit{selectedActivities.size === 1 ? "y" : "ies"} · {(0, format_1.fmt)(totalActivityCost)}
                </react_native_1.Text>)}
            </react_native_1.View>
          </react_native_1.View>
          <react_native_1.Pressable onPress={addToPlan} style={styles.addBtn}>
            <react_native_1.Text style={styles.addBtnText}>Add to Day Plan →</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>)}

      <AccomDetailModal_1.default visible={!!viewingAccom} accom={viewingAccom} attractionName={attraction.name} isSelected={!!viewingAccom && selectedAccom === viewingAccom.id} onClose={() => setViewingAccom(null)} onSelect={() => viewingAccom && setSelectedAccom(selectedAccom === viewingAccom.id ? undefined : viewingAccom.id)}/>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme_1.colors.sand },
    hero: { height: 260, backgroundColor: theme_1.colors.sand },
    heroImage: { width: "100%", height: "100%" },
    backBtn: { position: "absolute", top: 48, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
    offlineBtn: { position: "absolute", top: 48, right: 16, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.3)" },
    offlineText: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, color: "#fff" },
    heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
    heroTitle: { fontSize: 24, fontFamily: theme_1.fonts.display, color: "#fff", lineHeight: 28 },
    heroLocation: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 },
    content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
    description: { fontSize: 14, lineHeight: 20, color: theme_1.colors.charcoal, opacity: 0.75 },
    tabRow: { flexDirection: "row", borderRadius: 14, overflow: "hidden", backgroundColor: theme_1.colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)" },
    tabBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
    tabText: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold },
    hintText: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.5 },
    emptyHint: { fontSize: 13, color: theme_1.colors.charcoal, opacity: 0.5 },
    hiddenHint: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.4, paddingVertical: 8 },
    stickyCta: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        borderRadius: 18,
        padding: 16,
        backgroundColor: theme_1.colors.savanna,
        shadowColor: theme_1.colors.savanna,
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    stickyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    dayTotalLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(232,220,196,0.6)" },
    dayTotalValue: { fontSize: 20, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
    stickyDetail: { fontSize: 11, color: "rgba(232,220,196,0.7)" },
    addBtn: { paddingVertical: 13, borderRadius: 14, backgroundColor: theme_1.colors.terra, alignItems: "center" },
    addBtnText: { fontSize: 14, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
});
