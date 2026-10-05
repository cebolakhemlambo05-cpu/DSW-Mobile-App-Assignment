import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";
import { IconBack, IconOffline, IconGem } from "../components/Icons";
import Badge from "../components/Badge";
import BudgetSlider from "../components/BudgetSlider";
import AccomCard from "../components/AccomCard";
import ActivityCard from "../components/ActivityCard";
import AccomDetailModal from "../components/AccomDetailModal";
import WeatherStrip from "../components/WeatherStrip";
import { fetchJson } from "../config/api";

export default function AttractionScreen({ attraction, onBack, onAddToPlan, existingEntry }) {
  const [budget, setBudget] = useState(2500);
  const [tab, setTab] = useState("stays");
  const [selectedAccom, setSelectedAccom] = useState(existingEntry?.accommodation?.id);
  const [selectedActivities, setSelectedActivities] = useState(
    new Set(existingEntry?.activities?.map((a) => a.id) ?? [])
  );
  const [showOffline, setShowOffline] = useState(false);
  const [viewingAccom, setViewingAccom] = useState(null);
  const [accommodations, setAccommodations] = useState(attraction.accommodations || []);
  const [lodgingLoading, setLodgingLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (attraction.accommodations?.length) return undefined;
    setLodgingLoading(true);
    fetchJson(`/api/attractions/${encodeURIComponent(attraction.id)}/lodging`)
      .then(({ data }) => {
        if (active) setAccommodations(data || []);
      })
      .catch(() => {
        if (active) setAccommodations([]);
      })
      .finally(() => {
        if (active) setLodgingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attraction]);

  const sortedAccoms = useMemo(
    () => [...accommodations].sort((a, b) => (a.pricePerNight ?? Infinity) - (b.pricePerNight ?? Infinity)),
    [accommodations]
  );
  const pricedAccoms = useMemo(() => sortedAccoms.filter((a) => a.pricePerNight != null), [sortedAccoms]);
  const filteredAccoms = useMemo(() => pricedAccoms.filter((a) => a.pricePerNight <= budget), [pricedAccoms, budget]);
  const unknownPriceAccoms = useMemo(() => sortedAccoms.filter((a) => a.pricePerNight == null), [sortedAccoms]);
  const hiddenAccoms = useMemo(() => pricedAccoms.filter((a) => a.pricePerNight > budget), [pricedAccoms, budget]);

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
  const totalCost = (selectedAccomData?.pricePerNight ?? 0) + totalActivityCost;

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

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: attraction.image }} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable onPress={onBack} style={styles.backBtn}>
            <IconBack color="#fff" />
          </Pressable>
          <Pressable onPress={() => setShowOffline(!showOffline)} style={styles.offlineBtn}>
            <IconOffline color="#fff" />
            <Text style={styles.offlineText}>{showOffline ? "Saved offline" : "Save offline"}</Text>
          </Pressable>
          <View style={styles.heroTextWrap}>
            {attraction.localFav && (
              <View style={{ marginBottom: 6, alignSelf: "flex-start" }}>
                <Badge color="sky" icon={<IconGem />}>
                  Local Favourite
                </Badge>
              </View>
            )}
            <Text style={styles.heroTitle}>{attraction.name}</Text>
            <Text style={styles.heroLocation}>{attraction.location}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{attraction.description}</Text>

          <WeatherStrip latitude={attraction.map?.latitude} longitude={attraction.map?.longitude} />

          <BudgetSlider value={budget} onChange={setBudget} label="Filter by budget" />

          <View style={styles.tabRow}>
            {["stays", "activities"].map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, tab === t && { backgroundColor: colors.savanna }]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === t ? colors.ivory : colors.charcoal, opacity: tab === t ? 1 : 0.6 },
                  ]}
                >
                  {t === "stays" ? "Where to Sleep" : "What to Do"}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "stays" && (
            <View style={{ gap: 8 }}>
              <Text style={styles.hintText}>
                Sorted cheapest → most expensive · Tap to view details & select · Distance to{" "}
                {attraction.name.split(" ")[0]} gate
              </Text>
              {lodgingLoading && (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <Text style={styles.emptyHint}>Loading nearby stays...</Text>
                </View>
              )}
              {!lodgingLoading && filteredAccoms.length === 0 && unknownPriceAccoms.length === 0 && (
                <View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <Text style={styles.emptyHint}>
                    No stays within R{budget.toLocaleString("en-ZA")} — try raising your budget
                  </Text>
                </View>
              )}
              {filteredAccoms.map((ac) => (
                <AccomCard
                  key={ac.id}
                  accom={ac}
                  selected={selectedAccom === ac.id}
                  onView={() => setViewingAccom(ac)}
                  onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)}
                />
              ))}
              {unknownPriceAccoms.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={styles.hintText}>
                    Google provides price levels, not live nightly rates. Check each property for current pricing.
                  </Text>
                  {unknownPriceAccoms.map((ac) => (
                    <AccomCard
                      key={ac.id}
                      accom={ac}
                      selected={selectedAccom === ac.id}
                      onView={() => setViewingAccom(ac)}
                      onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)}
                    />
                  ))}
                </View>
              )}
              {hiddenAccoms.length > 0 && (
                <Text style={styles.hiddenHint}>{hiddenAccoms.length} stay(s) hidden (over budget)</Text>
              )}
            </View>
          )}

          {tab === "activities" && (
            <View style={{ gap: 8 }}>
              <Text style={styles.hintText}>Tap to add to your day plan · Prices per person</Text>
              {attraction.activities.map((act) => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  selected={selectedActivities.has(act.id)}
                  onToggle={() => toggleActivity(act.id)}
                />
              ))}
            </View>
          )}

          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {(selectedAccomData || selectedActivities.size > 0) && (
        <View style={styles.stickyCta}>
          <View style={styles.stickyRow}>
            <View>
              <Text style={styles.dayTotalLabel}>Day Total</Text>
              <Text style={styles.dayTotalValue}>{fmt(totalCost)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {selectedAccomData && (
                <Text style={styles.stickyDetail}>
                  {selectedAccomData.name} · {fmt(selectedAccomData.pricePerNight)}
                </Text>
              )}
              {selectedActivities.size > 0 && (
                <Text style={styles.stickyDetail}>
                  {selectedActivities.size} activit{selectedActivities.size === 1 ? "y" : "ies"} ·{" "}
                  {fmt(totalActivityCost)}
                </Text>
              )}
            </View>
          </View>
          <Pressable onPress={addToPlan} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add to Day Plan →</Text>
          </Pressable>
        </View>
      )}

      <AccomDetailModal
        visible={!!viewingAccom}
        accom={viewingAccom}
        attractionName={attraction.name}
        isSelected={!!viewingAccom && selectedAccom === viewingAccom.id}
        onClose={() => setViewingAccom(null)}
        onSelect={() => viewingAccom && setSelectedAccom(selectedAccom === viewingAccom.id ? undefined : viewingAccom.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  hero: { height: 260, backgroundColor: colors.sand },
  heroImage: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  offlineText: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: "#fff" },
  heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
  heroTitle: { fontSize: 24, fontFamily: fonts.display, color: "#fff", lineHeight: 28 },
  heroLocation: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  description: { fontSize: 14, lineHeight: 20, color: colors.charcoal, opacity: 0.75 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.1)",
  },
  tabBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: fonts.bodySemiBold },
  hintText: { fontSize: 11, color: colors.charcoal, opacity: 0.5 },
  emptyHint: { fontSize: 13, color: colors.charcoal, opacity: 0.5 },
  hiddenHint: { fontSize: 11, color: colors.charcoal, opacity: 0.4, paddingVertical: 8 },
  stickyCta: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.savanna,
    shadowColor: colors.savanna,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  stickyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  dayTotalLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "rgba(232,220,196,0.6)",
  },
  dayTotalValue: { fontSize: 20, fontFamily: fonts.display, color: colors.ivory },
  stickyDetail: { fontSize: 11, color: "rgba(232,220,196,0.7)" },
  addBtn: { paddingVertical: 13, borderRadius: 14, backgroundColor: colors.terra, alignItems: "center" },
  addBtnText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.ivory },
});