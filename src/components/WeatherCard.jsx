import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";
import { fetchWeather } from "../services/placesService";

export default function WeatherCard({ latitude, longitude, locationName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      setLoading(false);
      setError("Location unavailable");
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchWeather({
      latitude: Number(latitude),
      longitude: Number(longitude),
      signal: controller.signal,
    })
      .then((data) => { if (active) setWeather(data); })
      .catch((err) => {
        if (active && err?.name !== "AbortError") setError(err.message || "Weather unavailable");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [latitude, longitude]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.savanna} />
        <Text style={styles.loadingText}>Checking weather…</Text>
      </View>
    );
  }

  if (error || !weather?.current) {
    return null; // Fail silently — weather is a bonus, not essential
  }

  const { current, hourly } = weather;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Weather</Text>
        <Text style={styles.headerLocation}>{locationName || weather.timezone}</Text>
      </View>

      <View style={styles.currentRow}>
        <Text style={styles.icon}>{current.icon}</Text>
        <View style={styles.currentTextWrap}>
          <Text style={styles.temp}>{current.temp}°C</Text>
          <Text style={styles.label}>{current.label}</Text>
        </View>
        <View style={styles.metaWrap}>
          <Text style={styles.meta}>Feels {current.feelsLike}°</Text>
          <Text style={styles.meta}>💧 {current.humidity}%</Text>
          <Text style={styles.meta}>💨 {Math.round(current.windSpeed)} km/h</Text>
        </View>
      </View>

      {Array.isArray(hourly) && hourly.length > 0 && (
        <View style={styles.hourlyRow}>
          {hourly.slice(0, 6).map((h) => {
            const timeLabel = String(h.time || "").slice(11, 16);
            return (
              <View key={h.time} style={styles.hourCell}>
                <Text style={styles.hourTime}>{timeLabel}</Text>
                <Text style={styles.hourIcon}>{h.icon}</Text>
                <Text style={styles.hourTemp}>{h.temp}°</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ivory,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.08)",
    gap: 10,
  },
  loadingText: { fontSize: 12, color: colors.charcoal, opacity: 0.6, textAlign: "center", marginTop: 6 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLabel: { fontSize: 10, fontFamily: fonts.bodySemiBold, textTransform: "uppercase", letterSpacing: 0.6, color: colors.charcoal, opacity: 0.5 },
  headerLocation: { fontSize: 11, color: colors.charcoal, opacity: 0.6 },
  currentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { fontSize: 38 },
  currentTextWrap: { flex: 1 },
  temp: { fontSize: 26, fontFamily: fonts.display, color: colors.charcoal },
  label: { fontSize: 12, color: colors.charcoal, opacity: 0.7, marginTop: 2 },
  metaWrap: { alignItems: "flex-end", gap: 2 },
  meta: { fontSize: 11, color: colors.charcoal, opacity: 0.65 },
  hourlyRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)", paddingTop: 10 },
  hourCell: { alignItems: "center", gap: 2 },
  hourTime: { fontSize: 10, color: colors.charcoal, opacity: 0.5 },
  hourIcon: { fontSize: 18 },
  hourTemp: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
});