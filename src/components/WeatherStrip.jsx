import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { fetchJson } from "../config/api";
import { colors, fonts } from "../theme/theme";

export default function WeatherStrip({ latitude, longitude, days = 5 }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (latitude == null || longitude == null) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    fetchJson(
      `/api/weather?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}&days=${encodeURIComponent(days)}`
    )
      .then(({ weather }) => {
        if (active) setWeather(weather);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [latitude, longitude, days]);

  if (loading) return <Text style={{ opacity: 0.5, fontSize: 12 }}>Loading weather...</Text>;
  if (error || !weather) return null;

  return (
    <View style={{ gap: 8 }}>
      {weather.current && (
        <Text style={{ fontSize: 13, color: colors.charcoal, fontFamily: fonts.bodySemiBold }}>
          Right now: {Math.round(weather.current.temperature)}°C · {weather.current.condition}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {weather.daily.map((day) => (
            <View
              key={day.date}
              style={{
                backgroundColor: colors.ivory,
                borderRadius: 12,
                padding: 10,
                minWidth: 72,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, opacity: 0.6 }}>
                {new Date(day.date).toLocaleDateString("en-ZA", { weekday: "short" })}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: fonts.bodySemiBold, marginTop: 4 }}>
                {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
              </Text>
              {day.precipitationChance != null && (
                <Text style={{ fontSize: 10, color: colors.skyBlue || colors.sky, marginTop: 2 }}>
                  {day.precipitationChance}% rain
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}