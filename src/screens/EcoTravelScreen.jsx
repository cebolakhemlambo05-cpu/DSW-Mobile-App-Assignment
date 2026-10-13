import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Field from "../components/Field";
import { Header } from "./PrivacyScreen";
import { fetchEcoProfile, saveEcoProfile } from "../services/featureService";
import { colors, fonts } from "../theme/theme";

const FACTORS = [
  { mode: "Walking", factor: 0, points: 15 },
  { mode: "Cycling", factor: 0, points: 15 },
  { mode: "Bus", factor: 0.089, points: 8 },
  { mode: "Car", factor: 0.192, points: 0 },
];

export default function EcoTravelScreen({ user, onBack }) {
  const [distance, setDistance] = useState("10");
  const [profile, setProfile] = useState({ choices: [], points: 0 });

  useEffect(() => {
    fetchEcoProfile(user.email).then((data) => setProfile(data.profile || { choices: [], points: 0 })).catch(console.error);
  }, [user.email]);

  const estimates = useMemo(() => {
    const km = Math.max(0, Number(distance) || 0);
    return FACTORS.map((item) => ({
      ...item,
      emissions: km * item.factor,
      eligiblePoints: item.factor <= 0.089 ? item.points : 0,
    }));
  }, [distance]);
  const best = estimates.reduce((winner, item) => (item.emissions < winner.emissions ? item : winner), estimates[0]);
  const totalPoints = profile.points || 0;

  const choose = (item) => {
    const next = {
      points: totalPoints + item.eligiblePoints,
      choices: [
        ...(profile.choices || []),
        {
          id: String(Date.now()),
          mode: item.mode,
          distanceKm: Number(distance) || 0,
          emissionsKg: item.emissions,
          points: item.eligiblePoints,
          verified: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setProfile(next);
    saveEcoProfile(user.email, next).catch(console.error);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Eco Challenge" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.label}>Eco-score</Text>
          <Text style={styles.score}>{totalPoints}</Text>
          <Text style={styles.body}>Points reward lower-emission planning choices only. They do not verify real-world travel.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.section}>Compare transport</Text>
          <Field label="Distance in km" value={distance} onChangeText={setDistance} keyboardType="numeric" />
          <Text style={styles.body}>Emission factors are documented estimates in kg CO2e per passenger-km: walking/cycling 0, bus 0.089, car 0.192. Actual emissions vary by vehicle, route, occupancy and conditions.</Text>
        </View>
        <View style={styles.card}>
          {estimates.map((item) => (
            <View key={item.mode} style={[styles.option, item.mode === best.mode && styles.best]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mode}>{item.mode}</Text>
                <Text style={styles.body}>{item.emissions.toFixed(2)} kg CO2e estimate</Text>
              </View>
              <Pressable onPress={() => choose(item)} style={styles.choose}>
                <Text style={styles.chooseText}>{item.eligiblePoints ? `+${item.eligiblePoints}` : "Log"}</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.section}>Achievements</Text>
          <Text style={styles.body}>{totalPoints >= 100 ? "Low-carbon route champion" : totalPoints >= 50 ? "Sustainable planner" : "Start with a walk, cycle or bus route to build your score."}</Text>
          {(profile.choices || []).slice(-5).reverse().map((choice) => (
            <Text key={choice.id} style={styles.history}>{choice.mode}: {choice.distanceKm} km, {choice.emissionsKg.toFixed(2)} kg CO2e, +{choice.points} points</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 16, gap: 12 },
  hero: { padding: 20, borderRadius: 20, backgroundColor: colors.savanna, gap: 6 },
  label: { color: "rgba(250,246,239,0.64)", fontFamily: fonts.bodyBold, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7 },
  score: { color: colors.ivory, fontFamily: fonts.display, fontSize: 52 },
  body: { color: colors.charcoal, opacity: 0.67, lineHeight: 19 },
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.ivory, gap: 10 },
  section: { color: colors.sky, fontFamily: fonts.bodyBold, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7 },
  option: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.sand },
  best: { borderWidth: 1, borderColor: colors.savanna },
  mode: { color: colors.charcoal, fontFamily: fonts.bodyBold },
  choose: { minWidth: 54, padding: 10, borderRadius: 12, alignItems: "center", backgroundColor: colors.terra },
  chooseText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  history: { color: colors.charcoal, opacity: 0.7, fontSize: 12 },
});
