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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DayPlanScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const attractions_1 = require("../data/attractions");
const format_1 = require("../utils/format");
const Icons_1 = require("../components/Icons");
function DayPlanScreen({ plan, onBack, onRemove, onClearAll, onSelectAttraction, }) {
    const [groupSize, setGroupSize] = (0, react_1.useState)(1);
    const totalAccom = plan.reduce((s, e) => { var _a, _b; return s + ((_b = (_a = e.accommodation) === null || _a === void 0 ? void 0 : _a.price) !== null && _b !== void 0 ? _b : 0); }, 0);
    const totalActivities = plan.reduce((s, e) => s + e.activities.reduce((ss, a) => ss + a.price, 0), 0);
    const grandTotal = totalAccom + totalActivities * groupSize;
    const perPerson = groupSize > 0 ? grandTotal / groupSize : 0;
    return (<react_native_1.View style={styles.screen}>
      <react_native_safe_area_context_1.SafeAreaView edges={["top"]} style={styles.header}>
        <react_native_1.Pressable onPress={onBack}>
          <Icons_1.IconBack color={theme_1.colors.sand}/>
        </react_native_1.Pressable>
        <react_native_1.View style={{ flex: 1 }}>
          <react_native_1.Text style={styles.headerLabel}>Your</react_native_1.Text>
          <react_native_1.Text style={styles.headerTitle}>Day Plan</react_native_1.Text>
        </react_native_1.View>
        {plan.length > 0 && (<react_native_1.Pressable onPress={onClearAll} style={styles.clearBtn}>
            <Icons_1.IconTrash color="rgba(232,220,196,0.7)"/>
            <react_native_1.Text style={styles.clearText}>Clear all</react_native_1.Text>
          </react_native_1.Pressable>)}
      </react_native_safe_area_context_1.SafeAreaView>

      <react_native_1.ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {plan.length === 0 ? (<react_native_1.View style={styles.emptyState}>
            <react_native_1.Text style={styles.emptyEmoji}>🗺️</react_native_1.Text>
            <react_native_1.Text style={styles.emptyTitle}>Your plan is empty</react_native_1.Text>
            <react_native_1.Text style={styles.emptySubtitle}>Browse attractions and add stays & activities to build your day</react_native_1.Text>
            <react_native_1.Pressable onPress={onBack} style={styles.exploreBtn}>
              <react_native_1.Text style={styles.exploreBtnText}>Explore Attractions</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>) : (<>
            <react_native_1.View style={styles.groupCard}>
              <react_native_1.View style={styles.groupRow}>
                <react_native_1.View style={styles.groupInfo}>
                  <Icons_1.IconUsers color={theme_1.colors.sky}/>
                  <react_native_1.View>
                    <react_native_1.Text style={styles.groupTitle}>Group Split Calculator</react_native_1.Text>
                    <react_native_1.Text style={styles.groupSubtitle}>Activities cost split per person</react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={styles.stepperRow}>
                  <react_native_1.Pressable onPress={() => setGroupSize(Math.max(1, groupSize - 1))} style={styles.stepperBtn}>
                    <react_native_1.Text style={styles.stepperBtnText}>−</react_native_1.Text>
                  </react_native_1.Pressable>
                  <react_native_1.Text style={styles.stepperValue}>{groupSize}</react_native_1.Text>
                  <react_native_1.Pressable onPress={() => setGroupSize(Math.min(20, groupSize + 1))} style={styles.stepperBtn}>
                    <react_native_1.Text style={styles.stepperBtnText}>+</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={{ gap: 12 }}>
              {plan.map((entry) => {
                const attraction = attractions_1.ATTRACTIONS.find((a) => a.id === entry.attractionId);
                return (<react_native_1.View key={entry.attractionId} style={styles.entryCard}>
                    <react_native_1.View style={styles.entryHero}>
                      <react_native_1.Image source={{ uri: attraction.image }} style={styles.entryImage}/>
                      <expo_linear_gradient_1.LinearGradient colors={["rgba(0,0,0,0.5)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={react_native_1.StyleSheet.absoluteFill}/>
                      <react_native_1.View style={styles.entryHeroContent}>
                        <react_native_1.View style={{ flex: 1 }}>
                          <react_native_1.Text style={styles.entryTitle}>{entry.attractionName}</react_native_1.Text>
                          <react_native_1.Text style={styles.entryLocation}>{attraction.location}</react_native_1.Text>
                        </react_native_1.View>
                        <react_native_1.View style={styles.entryActions}>
                          <react_native_1.Pressable onPress={() => onSelectAttraction(attraction)} style={styles.editBtn}>
                            <react_native_1.Text style={styles.editBtnText}>Edit</react_native_1.Text>
                          </react_native_1.Pressable>
                          <react_native_1.Pressable onPress={() => onRemove(entry.attractionId)} style={styles.removeBtn}>
                            <react_native_1.Text style={styles.removeBtnText}>Remove</react_native_1.Text>
                          </react_native_1.Pressable>
                        </react_native_1.View>
                      </react_native_1.View>
                    </react_native_1.View>
                    <react_native_1.View style={styles.entryBody}>
                      {entry.accommodation && (<react_native_1.View style={styles.lineRow}>
                          <react_native_1.Text style={styles.lineLabel}>🛏 {entry.accommodation.name}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineValue}>
                            {(0, format_1.fmt)(entry.accommodation.price)}
                            <react_native_1.Text style={styles.lineUnit}>/night</react_native_1.Text>
                          </react_native_1.Text>
                        </react_native_1.View>)}
                      {entry.activities.map((act) => (<react_native_1.View key={act.id} style={styles.lineRow}>
                          <react_native_1.Text style={styles.lineLabel}>🎯 {act.name}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineValue}>
                            {(0, format_1.fmt)(act.price * groupSize)}
                            {groupSize > 1 && <react_native_1.Text style={styles.lineUnit}> ({groupSize}×)</react_native_1.Text>}
                          </react_native_1.Text>
                        </react_native_1.View>))}
                    </react_native_1.View>
                  </react_native_1.View>);
            })}
            </react_native_1.View>

            <react_native_1.View style={styles.breakdownCard}>
              <react_native_1.Text style={styles.breakdownTitle}>Cost Breakdown</react_native_1.Text>
              <react_native_1.View style={{ gap: 8, marginBottom: 16 }}>
                <react_native_1.View style={styles.breakdownRow}>
                  <react_native_1.Text style={styles.breakdownLabel}>Accommodation total</react_native_1.Text>
                  <react_native_1.Text style={styles.breakdownValue}>{(0, format_1.fmt)(totalAccom)}</react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.breakdownRow}>
                  <react_native_1.Text style={styles.breakdownLabel}>Activities ({groupSize} person{groupSize > 1 ? "s" : ""})</react_native_1.Text>
                  <react_native_1.Text style={styles.breakdownValue}>{(0, format_1.fmt)(totalActivities * groupSize)}</react_native_1.Text>
                </react_native_1.View>
                {groupSize > 1 && (<react_native_1.View style={[styles.breakdownRow, styles.perPersonRow]}>
                    <react_native_1.Text style={styles.perPersonLabel}>Per person (activities split)</react_native_1.Text>
                    <react_native_1.Text style={styles.perPersonLabel}>{(0, format_1.fmt)(perPerson)}</react_native_1.Text>
                  </react_native_1.View>)}
              </react_native_1.View>
              <react_native_1.View style={styles.grandTotalRow}>
                <react_native_1.View>
                  <react_native_1.Text style={styles.grandTotalLabel}>Grand Total</react_native_1.Text>
                  {groupSize > 1 && (<react_native_1.Text style={styles.perPersonNote}>R{Math.round(perPerson).toLocaleString("en-ZA")} per person</react_native_1.Text>)}
                </react_native_1.View>
                <react_native_1.Text style={styles.grandTotalValue}>{(0, format_1.fmt)(grandTotal)}</react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>
          </>)}
      </react_native_1.ScrollView>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme_1.colors.sand },
    header: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme_1.colors.savanna, paddingHorizontal: 20, paddingVertical: 12 },
    headerLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.6)" },
    headerTitle: { fontSize: 20, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
    clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    clearText: { fontSize: 12, color: "rgba(232,220,196,0.6)" },
    content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, gap: 16 },
    emptyState: { paddingVertical: 80, alignItems: "center" },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontFamily: theme_1.fonts.display, fontSize: 18, color: theme_1.colors.charcoal },
    emptySubtitle: { fontSize: 13, color: theme_1.colors.charcoal, opacity: 0.55, marginTop: 8, marginBottom: 24, textAlign: "center" },
    exploreBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: theme_1.colors.terra },
    exploreBtnText: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    groupCard: { borderRadius: 16, padding: 16, backgroundColor: theme_1.colors.ivory, shadowColor: theme_1.colors.charcoal, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    groupRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    groupInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    groupTitle: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 0.3, textTransform: "uppercase", color: theme_1.colors.sky },
    groupSubtitle: { fontSize: 10, color: theme_1.colors.charcoal, opacity: 0.5, marginTop: 2 },
    stepperRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    stepperBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme_1.colors.sand, alignItems: "center", justifyContent: "center" },
    stepperBtnText: { fontSize: 18, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.charcoal },
    stepperValue: { width: 24, textAlign: "center", fontSize: 16, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.charcoal },
    entryCard: { borderRadius: 18, overflow: "hidden", backgroundColor: theme_1.colors.ivory, shadowColor: theme_1.colors.charcoal, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    entryHero: { height: 100 },
    entryImage: { width: "100%", height: "100%" },
    entryHeroContent: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    entryTitle: { fontSize: 15, fontFamily: theme_1.fonts.display, color: "#fff" },
    entryLocation: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
    entryActions: { flexDirection: "row", gap: 6 },
    editBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)" },
    editBtnText: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    removeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(201,123,74,0.8)" },
    removeBtnText: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    entryBody: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    lineRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    lineLabel: { fontSize: 13, color: theme_1.colors.charcoal, opacity: 0.7, flex: 1 },
    lineValue: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal },
    lineUnit: { fontSize: 11, fontFamily: theme_1.fonts.body, opacity: 0.5 },
    breakdownCard: { borderRadius: 18, padding: 20, backgroundColor: theme_1.colors.savanna },
    breakdownTitle: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 1, textTransform: "uppercase", color: "rgba(232,220,196,0.6)", marginBottom: 12 },
    breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
    breakdownLabel: { fontSize: 13, color: "rgba(232,220,196,0.8)" },
    breakdownValue: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    perPersonRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 8 },
    perPersonLabel: { fontSize: 11, color: "rgba(232,220,196,0.6)" },
    grandTotalRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 16 },
    grandTotalLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(232,220,196,0.6)" },
    perPersonNote: { fontSize: 11, color: "rgba(232,220,196,0.6)", marginTop: 2 },
    grandTotalValue: { fontSize: 30, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
});
