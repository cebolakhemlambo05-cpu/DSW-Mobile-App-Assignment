import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenContainer from "../../components/ScreenContainer";
import { colors } from "../../constants/colors";
import { getAttractionById } from "../../data/attractions";

export default function AttractionDetailScreen() {
  const { id } = useLocalSearchParams();
  const attraction = getAttractionById(id);

  if (!attraction) {
    return (
      <ScreenContainer backgroundColor={colors.sand}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Attraction not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>‹ Go back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const cheapestStay = [...attraction.accommodations].sort(
    (a, b) => a.price - b.price
  )[0];

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: attraction.image }} style={styles.hero} />

        <View style={styles.body}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Text style={styles.backLink}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{attraction.name}</Text>
          <Text style={styles.category}>{attraction.category}</Text>
          <Text style={styles.blurb}>{attraction.blurb}</Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Where to sleep</Text>
            <Text style={styles.sectionNote}>
              From R{cheapestStay.price} · {cheapestStay.distanceKm}km from gate
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push(`/accommodation?attractionId=${attraction.id}`)}
          >
            <Text style={styles.primaryButtonText}>See all stays</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What to do & what it costs</Text>
          </View>
          {attraction.activities.map((act) => (
            <View key={act.id} style={styles.activityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>{act.name}</Text>
                {act.note ? (
                  <Text style={styles.activityNote}>{act.note}</Text>
                ) : null}
              </View>
              <Text style={styles.activityPrice}>
                {act.price === 0 ? "Free" : `R${act.price}`}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/day-plan")}
          >
            <Text style={styles.secondaryButtonText}>Go to Day Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFound: { color: colors.charcoal, fontSize: 16, marginBottom: 12 },
  hero: { width: "100%", height: 220 },
  body: { paddingHorizontal: 24, paddingTop: 20 },
  backLink: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  title: { color: colors.charcoal, fontSize: 26, fontWeight: "800" },
  category: { color: colors.skyBlue, fontSize: 13, fontWeight: "700", marginTop: 4 },
  blurb: { color: "rgba(62,50,38,0.7)", fontSize: 14, lineHeight: 20, marginTop: 8 },
  sectionHeader: { marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: colors.charcoal, fontSize: 17, fontWeight: "700" },
  sectionNote: { color: "rgba(62,50,38,0.6)", fontSize: 13, marginTop: 2 },
  primaryButton: {
    backgroundColor: colors.clay,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: colors.ivory, fontSize: 15, fontWeight: "700" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  activityName: { color: colors.charcoal, fontSize: 15, fontWeight: "600" },
  activityNote: { color: "rgba(62,50,38,0.5)", fontSize: 12, marginTop: 2 },
  activityPrice: { color: colors.charcoal, fontSize: 15, fontWeight: "800" },
  secondaryButton: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.savanna,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: colors.savanna, fontSize: 15, fontWeight: "700" },
});
