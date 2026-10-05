import React, { useState } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, Linking, Alert } from "react-native";
import { colors, fonts } from "../theme/theme";
import { fetchDirectionsUrl } from "../services/placesService";

export default function DirectionsButton({ latitude, longitude, name }) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      Alert.alert("Directions unavailable", "We don't have coordinates for this destination.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchDirectionsUrl({
        toLat: Number(latitude),
        toLng: Number(longitude),
        toName: name || "Destination",
        mode: "driving",
      });
      const supported = await Linking.canOpenURL(result.url);
      if (!supported) throw new Error("No app can open Google Maps links.");
      await Linking.openURL(result.url);
    } catch (err) {
      Alert.alert("Could not open directions", err.message || "Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ivory} />
      ) : (
        <Text style={styles.text}>🧭  Get Directions</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: colors.terra || "#B85C38",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  text: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.ivory || "#FFF8EE" },
});