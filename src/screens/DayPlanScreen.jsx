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
const PhotoImage_1 = require("../components/PhotoImage");
const imageDefaults_1 = require("../utils/imageDefaults");
const featureService_1 = require("../services/featureService");
const tripTools_1 = require("../utils/tripTools");
function DayPlanScreen({ plan, user, onBack, onRemove, onClearAll, onSelectAttraction, onGroupSizeChange, onViewExpenses, onViewPacking, onSessionExpired, }) {
    const initialGuests = plan.find((entry) => Number.isInteger(entry.groupSize || entry.booking?.adults))?.groupSize || plan.find((entry) => Number.isInteger(entry.booking?.adults))?.booking.adults || 1;
    const [groupSize, setGroupSize] = (0, react_1.useState)(initialGuests);
    const [packingLists, setPackingLists] = (0, react_1.useState)({});
    const [expenseGroups, setExpenseGroups] = (0, react_1.useState)([]);
    const [tripToolsLoading, setTripToolsLoading] = (0, react_1.useState)(true);
    const [tripToolsError, setTripToolsError] = (0, react_1.useState)("");
    const [tripToolsReloadKey, setTripToolsReloadKey] = (0, react_1.useState)(0);
    const packingPlanKey = (0, tripTools_1.getPackingPlanKey)(plan);
    (0, react_1.useEffect)(() => {
        let active = true;
        if (!user?.email) {
            setTripToolsLoading(false);
            return () => { active = false; };
        }
        setTripToolsLoading(true);
        setTripToolsError("");
        Promise.all([
            (0, featureService_1.fetchPackingLists)(user.email),
            (0, featureService_1.fetchExpenseGroups)(user.email),
        ]).then(([packingData, expenseData]) => {
            if (!active)
                return;
            setPackingLists(packingData.lists && typeof packingData.lists === "object" ? packingData.lists : {});
            setExpenseGroups(Array.isArray(expenseData.groups) ? expenseData.groups : []);
        }).catch((error) => {
            if (!active)
                return;
            if (error.code === "SESSION_EXPIRED")
                onSessionExpired?.();
            setTripToolsError(error.message || "Trip preparation details could not be loaded.");
        }).finally(() => {
            if (active)
                setTripToolsLoading(false);
        });
        return () => { active = false; };
    }, [user?.email, packingPlanKey, tripToolsReloadKey, onSessionExpired]);
    const packingSummary = packingLists[packingPlanKey] || {};
    const packedItems = Array.isArray(packingSummary.packed) ? packingSummary.packed : [];
    const checklistItems = Array.isArray(packingSummary.checklistItems) ? packingSummary.checklistItems : [];
    const packingItemTotal = Math.max(checklistItems.length, packedItems.length);
    const linkedExpenseGroups = expenseGroups.filter((group) => {
        if (group.tripPlanKey === packingPlanKey)
            return true;
        const destinations = Array.isArray(group.destinations) ? group.destinations : [];
        return destinations.length > 0 && destinations.every((destination) => plan.some((entry) =>
            String(entry.attractionName || "").toLowerCase() === String(destination.attractionName || "").toLowerCase()
        ));
    });
    const totalAccom = plan.reduce((sum, entry) => {
        const savedTotal = entry.booking?.accommodationTotal ?? entry.accommodationTotal;
        if (savedTotal != null && Number.isFinite(Number(savedTotal))) return sum + Number(savedTotal);
        const nightlyRate = Number(entry.accommodation?.price || 0);
        const rooms = Number(entry.roomQuantity || entry.booking?.roomQuantity || 1);
        const nights = Number(entry.stayNights || entry.booking?.nights || 1);
        return sum + nightlyRate * rooms * nights;
    }, 0);
    const totalReservationDue = plan.reduce((sum, entry) => sum + (entry.booking?.paymentStatus === "awaiting_payment" ? Number(entry.booking.amount || 0) : 0), 0);
    const totalActivities = plan.reduce((s, e) => s + e.activities.reduce((ss, a) => ss + a.price, 0), 0);
    const grandTotal = totalAccom + totalActivities * groupSize;
    const perPerson = groupSize > 0 ? grandTotal / groupSize : 0;
    const guestsNeedingRooms = plan.reduce((maximum, entry) => entry.accommodation ? Math.max(maximum, groupSize - Number(entry.roomSharing || entry.booking?.roomSharing || 2) * Number(entry.roomQuantity || entry.booking?.roomQuantity || 1), 0) : maximum, 0);
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
                    <react_native_1.Text style={styles.groupTitle}>Travel party</react_native_1.Text>
                    <react_native_1.Text style={styles.groupSubtitle}>Updates room allocation and activity totals</react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>
                <react_native_1.View style={styles.stepperRow}>
                  <react_native_1.Pressable onPress={() => { const next = Math.max(1, groupSize - 1); setGroupSize(next); onGroupSizeChange?.(next); }} style={styles.stepperBtn}>
                    <react_native_1.Text style={styles.stepperBtnText}>−</react_native_1.Text>
                  </react_native_1.Pressable>
                  <react_native_1.Text style={styles.stepperValue}>{groupSize}</react_native_1.Text>
                  <react_native_1.Pressable onPress={() => { const next = Math.min(27, groupSize + 1); setGroupSize(next); onGroupSizeChange?.(next); }} style={styles.stepperBtn}>
                    <react_native_1.Text style={styles.stepperBtnText}>+</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
              <react_native_1.View style={styles.tripTools}>
                <react_native_1.Text style={styles.tripToolsTitle}>Plan your trip together</react_native_1.Text>
                <react_native_1.Text style={styles.tripToolsSubtitle}>Use your saved destinations and stays to organise shared costs and packing.</react_native_1.Text>
                <react_native_1.View style={styles.tripToolsButtons}>
                  <react_native_1.Pressable onPress={onViewExpenses} style={styles.tripToolButton} accessibilityRole="button">
                    <react_native_1.Text style={styles.tripToolText}>Split trip expenses</react_native_1.Text>
                  </react_native_1.Pressable>
                  <react_native_1.Pressable onPress={onViewPacking} style={[styles.tripToolButton, styles.packingToolButton]} accessibilityRole="button">
                    <react_native_1.Text style={styles.tripToolText}>Prepare packing list</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={styles.prepSummary}>
              <react_native_1.Text style={styles.tripToolsTitle}>Your trip prep</react_native_1.Text>
              {!!tripToolsError && (<react_native_1.View style={styles.summaryError}>
                  <react_native_1.Text style={styles.groupSubtitle}>{tripToolsError}</react_native_1.Text>
                  <react_native_1.Pressable onPress={() => setTripToolsReloadKey((key) => key + 1)}>
                    <react_native_1.Text style={styles.summaryAction}>Retry</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>)}
              {tripToolsLoading ? (<react_native_1.Text style={styles.groupSubtitle}>Loading packing progress and shared costs…</react_native_1.Text>) : (<>
                  <react_native_1.View style={styles.summarySection}>
                    <react_native_1.Text style={styles.summaryTitle}>Packing · {packedItems.length}/{packingItemTotal} packed</react_native_1.Text>
                    <react_native_1.Text style={styles.groupSubtitle}>
                      {packingSummary.completed ? "Trip packing complete - you are ready to go." : packedItems.length ? "Your checked items:" : "No packing items checked yet. Build your trip-specific list."}
                    </react_native_1.Text>
                    {!!packedItems.length && <react_native_1.Text style={styles.summaryItems}>{packedItems.join(" · ")}</react_native_1.Text>}
                  </react_native_1.View>
                  <react_native_1.View style={styles.summarySection}>
                    <react_native_1.Text style={styles.summaryTitle}>Shared expenses</react_native_1.Text>
                    {linkedExpenseGroups.length ? linkedExpenseGroups.map((group) => {
                      const spend = (0, tripTools_1.getGroupSpend)(group);
                      return (<react_native_1.View key={group.id} style={styles.expenseSummaryRow}>
                          <react_native_1.View style={{ flex: 1 }}>
                            <react_native_1.Text style={styles.groupSubtitle}>{group.name}</react_native_1.Text>
                            <react_native_1.Text style={styles.groupSubtitle}>My share { (0, format_1.fmt)(spend.shares.Me || 0)} · average { (0, format_1.fmt)(spend.total / spend.memberCount)} per person</react_native_1.Text>
                          </react_native_1.View>
                          <react_native_1.Text style={styles.summaryAmount}>{(0, format_1.fmt)(spend.total)}</react_native_1.Text>
                        </react_native_1.View>);
                    }) : (<react_native_1.Text style={styles.groupSubtitle}>No shared expenses logged for this trip yet. Add members and expenses to see each person's share.</react_native_1.Text>)}
                  </react_native_1.View>
                </>)}
            </react_native_1.View>

            <react_native_1.View style={{ gap: 12 }}>
              {plan.map((entry) => {
                const attraction = attractions_1.ATTRACTIONS.find((a) => a.id === entry.attractionId);
                return (<react_native_1.View key={entry.attractionId} style={styles.entryCard}>
                    <react_native_1.View style={styles.entryHero}>
                      <PhotoImage_1.default uri={attraction.image} fallbackUri={imageDefaults_1.getAttractionFallbackImage(attraction)} style={styles.entryImage}/>
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
                            {(0, format_1.fmt)(entry.accommodation.price, entry.accommodation.currency)}
                            <react_native_1.Text style={styles.lineUnit}>/room/night</react_native_1.Text>
                          </react_native_1.Text>
                        </react_native_1.View>)}
                      {entry.accommodation && (<react_native_1.View style={{ marginTop: 4 }}>
                          <react_native_1.Text style={styles.lineUnit}>{entry.groupSize || groupSize} guests · {entry.roomQuantity || 1} room{Number(entry.roomQuantity || 1) === 1 ? "" : "s"} · {entry.roomSharing || 2} sharing · {entry.stayNights || 1} night{Number(entry.stayNights || 1) === 1 ? "" : "s"} · {entry.checkInDate} to {entry.checkOutDate}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineValue}>Stay total: {(0, format_1.fmt)(entry.accommodationTotal ?? Number(entry.accommodation.price || 0) * Number(entry.roomQuantity || 1) * Number(entry.stayNights || 1), entry.accommodation.currency)}</react_native_1.Text>
                          {Math.max(0, (entry.groupSize || groupSize) - Number(entry.roomQuantity || 1) * Number(entry.roomSharing || 2)) > 0 && <react_native_1.Text style={styles.lineUnit}>{Math.max(0, (entry.groupSize || groupSize) - Number(entry.roomQuantity || 1) * Number(entry.roomSharing || 2))} guest{Math.max(0, (entry.groupSize || groupSize) - Number(entry.roomQuantity || 1) * Number(entry.roomSharing || 2)) === 1 ? "" : "s"} still need a room.</react_native_1.Text>}
                        </react_native_1.View>)}
                      {entry.booking && (<react_native_1.View style={{ marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: "#F4EBDD" }}>
                          <react_native_1.Text style={styles.lineLabel}>Reservation request · Payment due</react_native_1.Text>
                          <react_native_1.Text style={styles.lineUnit}>{entry.groupSize || entry.booking.adults} guest{(entry.groupSize || entry.booking.adults) === 1 ? "" : "s"} · {entry.booking.roomQuantity || 1} room{Number(entry.booking.roomQuantity || 1) === 1 ? "" : "s"} · {entry.booking.roomSharing || 2} sharing</react_native_1.Text>
                          <react_native_1.Text style={styles.lineUnit}>{entry.booking.checkIn} to {entry.booking.checkOut} · {entry.booking.nights || entry.stayNights || 1} night{Number(entry.booking.nights || entry.stayNights || 1) === 1 ? "" : "s"}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineValue}>Trip total due: {(0, format_1.fmt)(entry.booking.amount, entry.booking.currency)}</react_native_1.Text>
                          {Math.max(0, (entry.groupSize || entry.booking.adults) - (entry.booking.roomQuantity || 1) * (entry.booking.roomSharing || 2)) > 0 && <react_native_1.Text style={styles.lineUnit}>{Math.max(0, (entry.groupSize || entry.booking.adults) - (entry.booking.roomQuantity || 1) * (entry.booking.roomSharing || 2))} guest{Math.max(0, (entry.groupSize || entry.booking.adults) - (entry.booking.roomQuantity || 1) * (entry.booking.roomSharing || 2)) === 1 ? "" : "s"} still need a room.</react_native_1.Text>}
                          <react_native_1.Text selectable style={[styles.lineValue, { marginTop: 4 }]}>Booking ref: {entry.booking.bookingReference}</react_native_1.Text>
                          <react_native_1.Text selectable style={[styles.lineValue, { marginTop: 2 }]}>PAY@ payment reference: {entry.booking.paymentReference}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineUnit}>Payment method: {entry.booking.paymentMethod}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineUnit}>{entry.booking.emailStatus === "sent" ? "Reservation request receipt sent by email." : `Email receipt could not be sent: ${entry.booking.emailError || "check email settings"}`}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineUnit}>Hotelbeds reservation confirmation is still pending.</react_native_1.Text>
                        </react_native_1.View>)}
                      {entry.activities.map((act) => (<react_native_1.View key={act.id} style={styles.lineRow}>
                          <react_native_1.Text style={styles.lineLabel}>🎯 {act.name}</react_native_1.Text>
                          <react_native_1.Text style={styles.lineValue}>
                            {(0, format_1.fmt)(act.price * (entry.groupSize || groupSize))}
                            {(entry.groupSize || groupSize) > 1 && <react_native_1.Text style={styles.lineUnit}> ({entry.groupSize || groupSize}×)</react_native_1.Text>}
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
                <react_native_1.View style={[styles.breakdownRow, styles.perPersonRow]}>
                  <react_native_1.Text style={styles.perPersonLabel}>Saved trip amounts due</react_native_1.Text>
                  <react_native_1.Text style={styles.perPersonLabel}>{(0, format_1.fmt)(totalReservationDue)}</react_native_1.Text>
                </react_native_1.View>
                {groupSize > 1 && (<react_native_1.View style={[styles.breakdownRow, styles.perPersonRow]}>
                    <react_native_1.Text style={styles.perPersonLabel}>Estimated per person</react_native_1.Text>
                    <react_native_1.Text style={styles.perPersonLabel}>{(0, format_1.fmt)(perPerson)}</react_native_1.Text>
                  </react_native_1.View>)}
              </react_native_1.View>
              <react_native_1.View style={styles.grandTotalRow}>
                <react_native_1.View>
                  <react_native_1.Text style={styles.grandTotalLabel}>Trip Total Estimate</react_native_1.Text>
                  {groupSize > 1 && (<react_native_1.Text style={styles.perPersonNote}>R{Math.round(perPerson).toLocaleString("en-ZA")} per person</react_native_1.Text>)}
                </react_native_1.View>
                <react_native_1.Text style={styles.grandTotalValue}>{(0, format_1.fmt)(grandTotal)}</react_native_1.Text>
              </react_native_1.View>
              {guestsNeedingRooms > 0 &&               <react_native_1.Text style={styles.groupNotice}>{guestsNeedingRooms} guests still need room allocation. The estimate includes the selected rooms and planned activities.</react_native_1.Text>}
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
    groupSubtitle: { flexShrink: 1, fontSize: 12, lineHeight: 18, color: "rgba(45,42,36,0.68)", marginTop: 4 },
    tripTools: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)", gap: 6 },
    tripToolsTitle: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal },
    tripToolsSubtitle: { fontSize: 11, lineHeight: 16, color: "rgba(45,42,36,0.68)" },
    tripToolsButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
    tripToolButton: { minHeight: 42, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, backgroundColor: theme_1.colors.savanna, justifyContent: "center" },
    packingToolButton: { backgroundColor: theme_1.colors.sky },
    tripToolText: { color: theme_1.colors.ivory, fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold },
    prepSummary: { padding: 16, borderRadius: 16, backgroundColor: theme_1.colors.ivory, gap: 12 },
    summarySection: { gap: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)" },
    summaryTitle: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal },
    summaryItems: { fontSize: 12, lineHeight: 19, color: theme_1.colors.charcoal, opacity: 0.8 },
    summaryAmount: { fontSize: 13, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.savanna },
    expenseSummaryRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 5 },
    summaryError: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 10, borderRadius: 10, backgroundColor: "rgba(201,123,74,0.1)" },
    summaryAction: { color: theme_1.colors.sky, fontFamily: theme_1.fonts.bodyBold, fontSize: 12 },
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
    breakdownTitle: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 1, textTransform: "uppercase", color: "rgba(250,246,239,0.82)", marginBottom: 12 },
    breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
    breakdownLabel: { flex: 1, flexShrink: 1, fontSize: 13, lineHeight: 19, color: "rgba(250,246,239,0.9)" },
    breakdownValue: { maxWidth: "48%", flexShrink: 1, fontSize: 13, textAlign: "right", fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    perPersonRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 8 },
    perPersonLabel: { flex: 1, flexShrink: 1, fontSize: 12, lineHeight: 18, color: "rgba(250,246,239,0.82)" },
    grandTotalRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 16 },
    grandTotalLabel: { fontSize: 11, lineHeight: 16, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(250,246,239,0.82)" },
    perPersonNote: { fontSize: 12, lineHeight: 18, color: "rgba(250,246,239,0.82)", marginTop: 3 },
    grandTotalValue: { flexShrink: 1, maxWidth: "58%", textAlign: "right", fontSize: 28, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
    groupNotice: { fontSize: 12, lineHeight: 18, color: "rgba(250,246,239,0.82)", marginTop: 8 },
});
