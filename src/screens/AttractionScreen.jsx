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
const placesService_1 = require("../services/placesService");
function AttractionScreen({ attraction, onBack, onAddToPlan, existingEntry, }) {
    var _a, _b, _c;
    const [budget, setBudget] = (0, react_1.useState)(2500);
  const [liveAccommodations, setLiveAccommodations] = (0, react_1.useState)(null);
  const [liveLoading, setLiveLoading] = (0, react_1.useState)(false);
  (0, react_1.useEffect)(() => {
    const latitude = attraction.map?.latitude;
    const longitude = attraction.map?.longitude;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
      return undefined;
    const controller = new AbortController();
    setLiveLoading(true);
    (0, placesService_1.fetchAccommodationOffers)({ latitude, longitude, signal: controller.signal })
      .then((offers) => {
      if (offers.length > 0)
        setLiveAccommodations(offers);
    })
      .catch((error) => {
      if (error?.name !== "AbortError")
        console.warn("Live accommodation lookup failed:", error?.message || error);
    })
      .finally(() => setLiveLoading(false));
    return () => controller.abort();
  }, [attraction.id]);
  const accommodationList = liveAccommodations || (Array.isArray(attraction.accommodations) ? attraction.accommodations : []);
    const activityList = Array.isArray(attraction.activities) ? attraction.activities : [];
    const [tab, setTab] = (0, react_1.useState)(accommodationList.length > 0 ? "stays" : "activities");
    const [selectedAccom, setSelectedAccom] = (0, react_1.useState)((_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.accommodation) === null || _a === void 0 ? void 0 : _a.id);
    const [selectedActivities, setSelectedActivities] = (0, react_1.useState)(new Set((_b = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.activities.map((a) => a.id)) !== null && _b !== void 0 ? _b : []));
    const [showOffline, setShowOffline] = (0, react_1.useState)(false);
    const [viewingAccom, setViewingAccom] = (0, react_1.useState)(null);
    const sortedAccoms = (0, react_1.useMemo)(() => [...accommodationList].sort((a, b) => a.pricePerNight - b.pricePerNight), [accommodationList]);
    const filteredAccoms = (0, react_1.useMemo)(() => sortedAccoms.filter((a) => a.pricePerNight <= budget), [sortedAccoms, budget]);
    const hiddenAccoms = (0, react_1.useMemo)(() => sortedAccoms.filter((a) => a.pricePerNight > budget), [sortedAccoms, budget]);
    const toggleActivity = (id) => {
        setSelectedActivities((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const selectedAccomData = accommodationList.find((a) => a.id === selectedAccom);
    const selectedActivityData = activityList.filter((a) => selectedActivities.has(a.id));
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
          <react_native_1.View style={styles.locationCard}>
            <Icons_1.IconMapPin color={theme_1.colors.sky}/>
            <react_native_1.View style={{ flex: 1, marginLeft: 10 }}>
              <react_native_1.Text style={styles.locationLabel}>Map & location</react_native_1.Text>
              <react_native_1.Text style={styles.locationValue}>{attraction.location}</react_native_1.Text>
              <react_native_1.Text style={styles.locationHint}>{attraction.map?.mapQuery || attraction.location}</react_native_1.Text>
              {!!attraction.map?.latitude && <react_native_1.Text style={styles.locationHint}>Coordinates: {attraction.map.latitude}, {attraction.map.longitude}</react_native_1.Text>}
            </react_native_1.View>
          </react_native_1.View>

          {!!attraction.booking && <react_native_1.View style={styles.bookingCard}>
            <Icons_1.IconCalendar color={theme_1.colors.savanna}/>
            <react_native_1.View style={{ flex: 1, marginLeft: 10 }}>
              <react_native_1.Text style={styles.locationLabel}>Booking availability</react_native_1.Text>
              <react_native_1.Text style={styles.locationValue}>{attraction.booking.availabilityStatus || "Check availability"}</react_native_1.Text>
              <react_native_1.Text style={styles.locationHint}>Provider: {attraction.booking.bookingProvider || "Local operator"}</react_native_1.Text>
              {!!attraction.booking.availabilityCheckedAt && <react_native_1.Text style={styles.locationHint}>Last checked: {attraction.booking.availabilityCheckedAt}</react_native_1.Text>}
            </react_native_1.View>
          </react_native_1.View>}

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
                {liveLoading ? "Checking live accommodation availability..." : "Sorted cheapest → most expensive · Tap to view details & select · Distance to " + attraction.name.split(" ")[0] + " gate"}
              </react_native_1.Text>
                {filteredAccoms.length === 0 && (<react_native_1.View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <react_native_1.Text style={styles.emptyHint}>{sortedAccoms.length === 0 ? "No nearby accommodation details are available for this attraction yet." : `No stays within R${budget.toLocaleString("en-ZA")} — try raising your budget`}</react_native_1.Text>
                </react_native_1.View>)}
              {filteredAccoms.map((ac) => (<AccomCard_1.default key={ac.id} accom={ac} selected={selectedAccom === ac.id} onView={() => setViewingAccom(ac)} onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)}/>))}
              {hiddenAccoms.length > 0 && (<react_native_1.Text style={styles.hiddenHint}>{hiddenAccoms.length} stay(s) hidden (over budget)</react_native_1.Text>)}
            </react_native_1.View>)}

          {tab === "activities" && (<react_native_1.View style={{ gap: 8 }}>
              <react_native_1.Text style={styles.hintText}>Tap to add to your day plan · Prices per person</react_native_1.Text>
              {activityList.length === 0 ? (<react_native_1.Text style={styles.emptyHint}>No activities have been added for this attraction yet.</react_native_1.Text>) : activityList.map((act) => (<ActivityCard_1.default key={act.id} activity={act} selected={selectedActivities.has(act.id)} onToggle={() => toggleActivity(act.id)}/>))}
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
    locationCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: theme_1.colors.ivory, borderRadius: 14, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)", padding: 14 },
    locationLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, letterSpacing: 0.7, textTransform: "uppercase", color: theme_1.colors.savanna },
    locationValue: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, marginTop: 3 },
    locationHint: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.55, marginTop: 3 },
    bookingCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(58,90,64,0.08)", borderRadius: 14, padding: 14 },
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
