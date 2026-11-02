import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconBack } from "../components/Icons";
import { ATTRACTIONS } from "../data/attractions";
import { fetchPackingLists, savePackingLists } from "../services/featureService";
import { fetchWeatherForecast } from "../services/placesService";
import { colors, fonts } from "../theme/theme";
import { getPackingPlanKey } from "../utils/tripTools";

const ESSENTIALS = [
  "Passport or ID",
  "Phone charger",
  "Reusable water bottle",
  "Medication",
  "Toiletries",
  "Comfortable shoes",
];

function packingAdvice(forecast, activities, attractionCategory, accommodation) {
  const suggestions = new Map();
  const days = forecast?.days || [];
  if (days.some((day) => Number(day.precipitationChance) >= 50)) {
    suggestions.set("Rain jacket", "Forecast");
  }
  if (days.some((day) => Number(day.maxTemperatureC) >= 28)) {
    suggestions.set("Sun hat and sunscreen", "Forecast");
  }
  if (days.some((day) => Number(day.minTemperatureC) <= 8)) {
    suggestions.set("Warm layers", "Forecast");
  }
  const activityText = activities.map((activity) => activity.name || "").join(" ").toLowerCase();
  const destinationText = `${activityText} ${attractionCategory || ""}`.toLowerCase();
  if (/hike|trail|mountain|walk|safari|outdoor/.test(destinationText)) {
    suggestions.set("Day pack", "Attraction or activity");
  }
  if (/beach|coast|swim/.test(destinationText)) {
    suggestions.set("Swimwear", "Attraction or activity");
  }
  if (/museum|gallery|city|food/.test(destinationText)) {
    suggestions.set("Smart casual outfit", "Attraction or activity");
  }
  const amenityText = (accommodation?.amenities || []).join(" ").toLowerCase();
  if (/pool|swimming/.test(amenityText)) {
    suggestions.set("Swimwear", "Stay amenity");
  }
  if (/gym|fitness/.test(amenityText)) {
    suggestions.set("Workout clothes", "Stay amenity");
  }
  return suggestions;
}

export default function PackingAssistantScreen({ user, plan = [], onBack, onSessionExpired }) {
  const [lists, setLists] = useState({});
  const [weatherByStop, setWeatherByStop] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [weatherNotice, setWeatherNotice] = useState("");
  const saveQueue = useRef(Promise.resolve());
  const safePlan = Array.isArray(plan) ? plan : [];
  const stayPlan = safePlan.filter((entry) => entry.accommodation?.name);
  const planKey = getPackingPlanKey(safePlan);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError("");
    fetchPackingLists(user.email)
      .then((data) => {
        if (!active) return;
        setLists(data.lists && typeof data.lists === "object" && !Array.isArray(data.lists) ? data.lists : {});
      })
      .catch((loadError) => {
        if (active) {
          if (loadError.code === "SESSION_EXPIRED") onSessionExpired?.();
          setLoadFailed(true);
          setError(loadError.message || "Could not load your packing lists.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.email, reloadKey, onSessionExpired]);

  useEffect(() => {
    let active = true;
    const stops = stayPlan.map((entry) => {
      const attraction = ATTRACTIONS.find((item) =>
        String(item.id) === String(entry.attractionId)
      );
      return {
        ...entry,
        latitude: attraction?.map?.latitude ?? attraction?.latitude,
        longitude: attraction?.map?.longitude ?? attraction?.longitude,
      };
    }).filter((entry) =>
      entry.latitude != null &&
      entry.longitude != null &&
      Number.isFinite(Number(entry.latitude)) &&
      Number.isFinite(Number(entry.longitude))
    );
    setWeatherByStop({});
    setWeatherNotice("");
    if (stops.length === 0) {
      setWeatherLoading(false);
      return () => { active = false; };
    }

    setWeatherLoading(true);
    const lastForecastDate = new Date();
    lastForecastDate.setUTCHours(0, 0, 0, 0);
    lastForecastDate.setUTCDate(lastForecastDate.getUTCDate() + 6);
    if (stops.some((entry) => entry.checkInDate > lastForecastDate.toISOString().slice(0, 10))) {
      setWeatherNotice("Weather forecasts are only available for the next 7 days. Check again closer to your stay.");
    }

    Promise.all(stops.map(async (entry) => {
      try {
        const forecast = await fetchWeatherForecast({
          latitude: Number(entry.latitude),
          longitude: Number(entry.longitude),
          days: 7,
        });
        const stayForecast = {
          ...forecast,
          days: (forecast.days || []).filter((day) =>
            (!entry.checkInDate || day.date >= entry.checkInDate) &&
            (!entry.checkOutDate || day.date < entry.checkOutDate)
          ),
        };
        return [String(entry.attractionId), stayForecast];
      } catch {
        return [String(entry.attractionId), null];
      }
    })).then((results) => {
      if (!active) return;
      const forecasts = Object.fromEntries(results);
      setWeatherByStop(forecasts);
      if (Object.values(forecasts).some((forecast) => !forecast)) {
        setWeatherNotice("Some forecast-based suggestions are unavailable right now.");
      }
    }).finally(() => {
      if (active) setWeatherLoading(false);
    });
    return () => {
      active = false;
    };
  }, [planKey]);

  const suggestions = useMemo(() => {
    const generated = new Map(ESSENTIALS.map((name) => [name, "Essentials"]));
    stayPlan.forEach((entry) => {
      const suggestionsForStop = packingAdvice(
        weatherByStop[String(entry.attractionId)],
        entry.activities || [],
        ATTRACTIONS.find((item) => String(item.id) === String(entry.attractionId))?.category,
        entry.accommodation
      );
      suggestionsForStop.forEach((source, name) => {
        if (!generated.has(name)) generated.set(name, source);
      });
    });
    return [...generated].map(([name, source]) => ({ id: name.toLowerCase(), name, source }));
  }, [safePlan, weatherByStop]);

  const current = lists[planKey] || {};
  const customItems = Array.isArray(current.custom) ? current.custom : [];
  const packedItems = Array.isArray(current.packed) ? current.packed : [];
  const items = [
    ...suggestions,
    ...customItems.map((name) => ({ id: `custom-${name}`, name, source: "custom" })),
  ];
  const packedItemCount = items.filter((item) => packedItems.includes(item.name)).length;
  const allItemsPacked = items.length > 0 && packedItemCount === items.length;

  const persist = (nextCurrent) => {
    if (loadFailed) return;
    const checklistItems = [
      ...suggestions.map((item) => item.name),
      ...(Array.isArray(nextCurrent.custom) ? nextCurrent.custom : []),
    ];
    const updated = {
      ...lists,
      [planKey]: {
        ...nextCurrent,
        checklistItems,
      },
    };
    setLists(updated);
    setError("");
    setSaving(true);
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(() => savePackingLists(user.email, updated))
      .then(() => {
        setError("");
      })
      .catch((saveError) => {
        if (saveError.code === "SESSION_EXPIRED") onSessionExpired?.();
        setError(saveError.message || "Your packing changes could not be saved.");
      })
      .finally(() => setSaving(false));
  };

  const toggle = (name) => {
    if (loadFailed) return;
    const packed = new Set(packedItems);
    if (packed.has(name)) packed.delete(name);
    else packed.add(name);
    persist({ ...current, packed: [...packed], completed: false });
  };

  const addCustom = () => {
    if (loadFailed) return;
    const name = customItem.trim();
    if (!name) return;
    if (items.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setError("That item is already on your list.");
      return;
    }
    persist({ ...current, custom: [...customItems, name], completed: false });
    setCustomItem("");
  };

  const remove = (name) => {
    if (loadFailed) return;
    persist({
      ...current,
      custom: customItems.filter((item) => item !== name),
      packed: packedItems.filter((item) => item !== name),
      completed: false,
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to attractions">
          <IconBack color={colors.sand} />
        </Pressable>
        <Text style={styles.eyebrow}>GET READY FOR THE ROAD</Text>
        <Text style={styles.heading}>Packing assistant</Text>
        <Text style={styles.subtitle}>A checklist tailored to your plans and forecast.</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!!weatherNotice && <Text style={styles.meta}>{weatherNotice}</Text>}
        {saving && <View style={styles.saving}><ActivityIndicator color={colors.savanna} /><Text style={styles.meta}>Saving changes…</Text></View>}

        {stayPlan.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.title}>Choose a stay first</Text>
            <Text style={styles.body}>
              Packing suggestions are based on the destinations and accommodation saved in your Day Plan. Choose an attraction, select a stay and dates, then add it to your plan to build a trip-specific checklist.
            </Text>
            <Pressable onPress={onBack} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Return to your Day Plan</Text>
            </Pressable>
          </View>
        ) : (
          <>
        <View style={styles.card}>
          <Text style={styles.title}>Packing for your saved stays</Text>
          <Text style={styles.body}>
            Essentials, selected activities, attraction type, stay amenities and forecast for your stay dates are combined here.
          </Text>
          {stayPlan.map((entry) => (
            <View key={`${entry.attractionId}-${entry.accommodation.id || entry.accommodation.name}`} style={styles.tripRow}>
              <Text style={styles.tripDestination}>{entry.attractionName}</Text>
              <Text style={styles.meta}>{entry.accommodation.name}</Text>
              {!!entry.accommodation.amenities?.length && (
                <Text style={styles.meta}>
                  Stay amenities considered: {entry.accommodation.amenities.slice(0, 4).join(", ")}
                </Text>
              )}
              <Text style={styles.meta}>
                Check with the property whether towels and toiletries are provided.
              </Text>
              <Text style={styles.meta}>
                {entry.checkInDate && entry.checkOutDate
                  ? `${entry.checkInDate} to ${entry.checkOutDate}`
                  : `${entry.stayNights || 1} night${Number(entry.stayNights || 1) === 1 ? "" : "s"}`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Add your own item</Text>
          <TextInput
            value={customItem}
            onChangeText={setCustomItem}
            placeholder="Travel adapter, camera…"
            placeholderTextColor="rgba(62,50,38,0.42)"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={addCustom}
            editable={!loadFailed}
            accessibilityLabel="Custom packing item"
          />
          <Pressable onPress={addCustom} disabled={loadFailed} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add item</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.listHeading}>
            <Text style={styles.section}>Checklist</Text>
            <Text style={styles.meta}>{packedItemCount}/{items.length} packed</Text>
          </View>
          {loading ? (
            <View style={styles.loading}><ActivityIndicator color={colors.savanna} /><Text style={styles.meta}>Loading your saved list…</Text></View>
          ) : loadFailed ? (
            <View style={styles.loading}>
              <Text style={styles.meta}>Your saved checklist is protected. Reconnect and retry before changing it.</Text>
              <Pressable onPress={() => setReloadKey((key) => key + 1)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : items.map((item) => {
            const packed = packedItems.includes(item.name);
            return (
              <View key={`${item.source}-${item.name}`} style={styles.itemRow}>
                <Pressable
                  onPress={() => toggle(item.name)}
                  style={[styles.check, packed && styles.checkActive]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: packed }}
                  accessibilityLabel={`${packed ? "Unpack" : "Pack"} ${item.name}`}
                >
                  <Text style={styles.checkText}>{packed ? "✓" : ""}</Text>
                </Pressable>
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemName, packed && styles.packed]}>{item.name}</Text>
                  <Text style={styles.itemSource}>{item.source}</Text>
                </View>
                {item.source === "custom" && (
                  <Pressable onPress={() => remove(item.name)} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
          {!loading && !loadFailed && (
            <View style={styles.completion}>
              <Text style={styles.meta}>
                {weatherLoading
                  ? "Preparing suggestions for your trip dates…"
                  : current.completed
                  ? "Your packing list is complete. Packed items are shown on your Day Plan."
                  : allItemsPacked
                    ? "Everything is checked off. Mark this trip ready when your bag is packed."
                    : "Check off each item as you pack it. Your progress saves automatically."}
              </Text>
              <Pressable
                onPress={() => persist({ ...current, completed: true })}
                disabled={weatherLoading || !allItemsPacked || current.completed || saving}
                style={[styles.primaryButton, (weatherLoading || !allItemsPacked || current.completed || saving) && styles.buttonDisabled]}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>
                  {current.completed ? "Trip packing complete" : "Mark trip ready"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 18 },
  back: { width: 38, height: 38, justifyContent: "center", marginBottom: 8 },
  eyebrow: { color: colors.sand, opacity: 0.7, fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.2 },
  heading: { color: colors.ivory, fontSize: 25, fontFamily: fonts.display },
  subtitle: { color: colors.sand, opacity: 0.82, fontSize: 12, marginTop: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.ivory, gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.charcoal },
  body: { color: colors.charcoal, opacity: 0.68, lineHeight: 20, fontSize: 13 },
  section: { fontFamily: fonts.bodyBold, color: colors.terra, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7 },
  meta: { color: colors.charcoal, opacity: 0.58, fontSize: 12, lineHeight: 18 },
  input: { minHeight: 46, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(62,50,38,0.14)", backgroundColor: colors.ivory, color: colors.charcoal, fontFamily: fonts.body, fontSize: 14 },
  primaryButton: { minHeight: 46, padding: 12, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  listHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  tripRow: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)", gap: 3 },
  tripDestination: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(62,50,38,0.08)" },
  check: { width: 27, height: 27, borderRadius: 8, borderWidth: 1, borderColor: colors.sky, alignItems: "center", justifyContent: "center" },
  checkActive: { backgroundColor: colors.sky },
  checkText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  itemCopy: { flex: 1 },
  itemName: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  packed: { textDecorationLine: "line-through", opacity: 0.5 },
  itemSource: { color: colors.charcoal, opacity: 0.5, fontSize: 11, marginTop: 2, textTransform: "capitalize" },
  remove: { color: colors.terra, fontSize: 12, fontFamily: fonts.bodySemiBold },
  loading: { alignItems: "center", gap: 10, padding: 18 },
  completion: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)" },
  saving: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-end" },
  error: { padding: 12, borderRadius: 10, backgroundColor: "#FCE7E3", color: "#9B3328", fontSize: 12, lineHeight: 18 },
});
