import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Field from "../components/Field";
import { Header } from "./PrivacyScreen";
import { fetchPackingLists, savePackingLists } from "../services/featureService";
import { fetchWeatherSummary, getPackingAdvice } from "../services/weatherService";
import { colors, fonts } from "../theme/theme";

const baseItems = ["Passport or ID", "Phone charger", "Reusable water bottle", "Medication", "Toiletries", "Comfortable shoes"];

export default function PackingAssistantScreen({ user, plan, onBack }) {
  const [lists, setLists] = useState({});
  const [weatherByStop, setWeatherByStop] = useState({});
  const [customItem, setCustomItem] = useState("");
  const planKey = plan.map((entry) => entry.attractionId).join("-");

  useEffect(() => {
    fetchPackingLists(user.email).then((data) => setLists(data.lists || {})).catch(console.error);
  }, [user.email]);

  useEffect(() => {
    let active = true;
    plan.forEach((entry) => {
      if (!entry.latitude || !entry.longitude) return;
      fetchWeatherSummary(entry.latitude, entry.longitude, 5)
        .then((weather) => active && setWeatherByStop((prev) => ({ ...prev, [entry.attractionId]: weather })))
        .catch(() => active && setWeatherByStop((prev) => ({ ...prev, [entry.attractionId]: null })));
    });
    return () => { active = false; };
  }, [planKey]);

  const suggestions = useMemo(() => {
    const generated = new Set(baseItems);
    plan.forEach((entry) => {
      getPackingAdvice(weatherByStop[entry.attractionId], entry.activities || [], 5).forEach((item) => generated.add(item));
      const text = [entry.attractionName, ...(entry.activities || []).map((a) => a.name)].join(" ").toLowerCase();
      if (/museum|gallery|city|food/.test(text)) generated.add("Smart casual outfit");
      if (/beach|coast|swim/.test(text)) generated.add("Swimwear");
      if (/hike|trail|mountain|walk/.test(text)) generated.add("Day pack");
    });
    if (plan.length === 0) generated.add("Add day-plan stops for destination-specific suggestions");
    return [...generated].map((name) => ({ id: name.toLowerCase(), name, source: baseItems.includes(name) ? "essential" : "weather or itinerary" }));
  }, [plan, weatherByStop]);

  const current = lists[planKey] || {};
  const items = [...suggestions, ...(current.custom || []).map((name) => ({ id: `custom-${name}`, name, source: "custom" }))];
  const persist = (next) => {
    const updated = { ...lists, [planKey]: next };
    setLists(updated);
    savePackingLists(user.email, updated).catch(console.error);
  };
  const toggle = (name) => {
    const packed = new Set(current.packed || []);
    packed.has(name) ? packed.delete(name) : packed.add(name);
    persist({ ...current, packed: [...packed] });
  };
  const addCustom = () => {
    const name = customItem.trim();
    if (!name) return;
    persist({ ...current, custom: [...new Set([...(current.custom || []), name])] });
    setCustomItem("");
  };
  const remove = (name) => {
    persist({
      ...current,
      custom: (current.custom || []).filter((item) => item !== name),
      packed: (current.packed || []).filter((item) => item !== name),
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Packing" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Smart packing assistant</Text>
          <Text style={styles.body}>Suggestions combine your saved day plan, selected activities and available Open-Meteo forecasts. Forecast-based items are separate from general essentials.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Add your own item</Text>
          <Field placeholder="Travel adapter, camera..." value={customItem} onChangeText={setCustomItem} />
          <Pressable onPress={addCustom} style={styles.primary}><Text style={styles.primaryText}>Add item</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Checklist</Text>
          {items.map((item) => {
            const packed = (current.packed || []).includes(item.name);
            return (
              <View key={`${item.source}-${item.name}`} style={styles.itemRow}>
                <Pressable onPress={() => toggle(item.name)} style={[styles.check, packed && styles.checkActive]}>
                  <Text style={styles.checkText}>{packed ? "✓" : ""}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, packed && styles.packed]}>{item.name}</Text>
                  <Text style={styles.itemSource}>{item.source}</Text>
                </View>
                {item.source === "custom" && <Pressable onPress={() => remove(item.name)}><Text style={styles.remove}>Remove</Text></Pressable>}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.ivory, gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.charcoal },
  body: { color: colors.charcoal, opacity: 0.68, lineHeight: 20 },
  section: { fontFamily: fonts.bodyBold, color: colors.terra, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7 },
  primary: { padding: 13, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center" },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(62,50,38,0.08)" },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 1, borderColor: colors.sky, alignItems: "center", justifyContent: "center" },
  checkActive: { backgroundColor: colors.sky },
  checkText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  itemName: { color: colors.charcoal, fontFamily: fonts.bodySemiBold },
  packed: { textDecorationLine: "line-through", opacity: 0.5 },
  itemSource: { color: colors.charcoal, opacity: 0.5, fontSize: 11 },
  remove: { color: colors.terra, fontSize: 12, fontFamily: fonts.bodySemiBold },
});
