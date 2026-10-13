import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts } from "../theme/theme";
import { fetchWeatherForecast } from "../services/placesService";

const WEATHER = {
  clear: { label: "Clear", icon: "☀️" },
  partlyCloudy: { label: "Partly cloudy", icon: "⛅" },
  cloudy: { label: "Cloudy", icon: "☁️" },
  fog: { label: "Fog", icon: "🌫️" },
  drizzle: { label: "Drizzle", icon: "🌦️" },
  rain: { label: "Rain", icon: "🌧️" },
  snow: { label: "Snow", icon: "🌨️" },
  showers: { label: "Showers", icon: "🌧️" },
  storm: { label: "Thunderstorm", icon: "⛈️" },
};

function weatherForCode(code) {
  if (code === 0) return WEATHER.clear;
  if (code === 1 || code === 2) return WEATHER.partlyCloudy;
  if (code === 3) return WEATHER.cloudy;
  if (code === 45 || code === 48) return WEATHER.fog;
  if (code >= 51 && code <= 57) return WEATHER.drizzle;
  if (code >= 61 && code <= 67) return WEATHER.rain;
  if (code >= 71 && code <= 77) return WEATHER.snow;
  if (code >= 80 && code <= 82) return WEATHER.showers;
  if (code === 85 || code === 86) return WEATHER.snow;
  if (code === 95 || code === 96 || code === 99) return WEATHER.storm;
  return WEATHER.cloudy;
}

function formatDay(dateString, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export default function WeatherForecast({ latitude, longitude }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadForecast = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchWeatherForecast({
        latitude,
        longitude,
        days: 7,
        signal,
      });
      setForecast(result.days);
    } catch (loadError) {
      if (loadError?.name !== "AbortError") {
        setError(loadError?.message || "Could not load the weather forecast.");
      }
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setForecast([]);
      setError("Weather is unavailable because this attraction has no coordinates.");
      return undefined;
    }
    const controller = new AbortController();
    loadForecast(controller.signal);
    return () => controller.abort();
  }, [latitude, longitude, loadForecast]);

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>7-day weather</Text>
          <Text style={styles.subtitle}>Prepare for the forecast at this attraction</Text>
        </View>
        {loading && <ActivityIndicator color={colors.savanna} />}
      </View>
      {loading && forecast.length === 0 ? (
        <Text style={styles.message}>Loading the 7-day forecast...</Text>
      ) : error ? (
        <View style={styles.errorRow}>
          <Text style={[styles.message, styles.errorText]}>{error}</Text>
          {Number.isFinite(latitude) && Number.isFinite(longitude) && (
            <Pressable accessibilityRole="button" onPress={() => loadForecast()}>
              <Text style={styles.retry}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastRow}
          >
            {forecast.map((day, index) => {
              const weather = weatherForCode(day.weatherCode);
              return (
                <View key={day.date} style={styles.dayCard}>
                  <Text style={styles.dayName}>{formatDay(day.date, index)}</Text>
                  <Text style={styles.weatherIcon}>{weather.icon}</Text>
                  <Text style={styles.condition} numberOfLines={2}>{weather.label}</Text>
                  <Text style={styles.temperature}>
                    {Math.round(day.maxTemperatureC)}° / {Math.round(day.minTemperatureC)}°
                  </Text>
                  <Text style={styles.dayDetail}>
                    {day.precipitationChance == null ? "Rain —" : `Rain ${day.precipitationChance}%`}
                  </Text>
                  <Text style={styles.dayDetail}>
                    {day.windSpeedKmh == null ? "Wind —" : `Wind ${Math.round(day.windSpeedKmh)} km/h`}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
          <Text style={styles.units}>Temperatures in °C · Forecast by Open-Meteo</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.08)",
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontFamily: fonts.display, color: colors.charcoal },
  subtitle: { fontSize: 11, color: colors.charcoal, opacity: 0.58, marginTop: 2 },
  forecastRow: { gap: 8, paddingRight: 4 },
  dayCard: {
    width: 100,
    minHeight: 146,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.sand,
  },
  dayName: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  weatherIcon: { fontSize: 25, marginTop: 5 },
  condition: {
    height: 28,
    fontSize: 10,
    textAlign: "center",
    color: colors.charcoal,
    opacity: 0.7,
  },
  temperature: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.charcoal, marginTop: 4 },
  dayDetail: { fontSize: 9, color: colors.charcoal, opacity: 0.65, marginTop: 4 },
  units: { fontSize: 9, color: colors.charcoal, opacity: 0.45, marginTop: 10 },
  message: { fontSize: 12, lineHeight: 18, color: colors.charcoal, opacity: 0.65 },
  errorRow: { gap: 8 },
  errorText: { color: "#9B3328", opacity: 1 },
  retry: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.savanna },
});
