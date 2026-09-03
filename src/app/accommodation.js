import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";
import { getAttractionById } from "../data/attractions";

export default function AccommodationScreen() {
  const { attractionId } = useLocalSearchParams();
  const attraction = getAttractionById(attractionId);

  if (!attraction) {
    return (
      <ScreenContainer backgroundColor={colors.sand}>
        <View style={styles.center}>
          <Text style={styles.notFound}>No attraction selected.</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={styles.backLink}>‹ Back to search</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const sorted = [...attraction.accommodations].sort((a, b) => a.price - b.price);

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Stays near {attraction.name}</Text>
        <Text style={styles.subtitle}>Cheapest to most expensive</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {sorted.map((stay) => (
          <View key={stay.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{stay.name}</Text>
              <Text style={styles.cardDistance}>
                📍 {stay.distanceKm}km from the gate
              </Text>
            </View>
            <Text style={styles.cardPrice}>R{stay.price}/night</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFound: { color: colors.charcoal, fontSize: 16, marginBottom: 12 },
  backLink: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { color: colors.charcoal, fontSize: 24, fontWeight: "800", marginTop: 12 },
  subtitle: { color: "rgba(62,50,38,0.6)", fontSize: 13, marginTop: 4 },
  list: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ivory,
    borderRadius: 16,
    padding: 16,
  },
  cardName: { color: colors.charcoal, fontSize: 16, fontWeight: "700" },
  cardDistance: { color: colors.skyBlue, fontSize: 13, marginTop: 4 },
  cardPrice: { color: colors.charcoal, fontSize: 16, fontWeight: "800" },
});
