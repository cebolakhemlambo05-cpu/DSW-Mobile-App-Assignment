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
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import PriceTag from "../../components/PriceTag";
import { colors } from "../../constants/colors";
import { getAttractionById } from "../../data/attractions";
import { useDayPlan } from "../../context/DayPlanContext";

export default function AttractionDetailScreen() {
  const { id } = useLocalSearchParams();
  const attraction = getAttractionById(id);
  const { selectedActivities, toggleActivity, chooseAttraction, attractionId } = useDayPlan();

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

  const cheapestStay = [...attraction.accommodations].sort((a, b) => a.price - b.price)[0];
  const isActive = (activityId) => selectedActivities.some((a) => a.id === activityId);

  const handleToggleActivity = (act) => {
    if (attractionId !== attraction.id) {
      chooseAttraction(attraction.id, attraction.name);
    }
    toggleActivity(act);
  };

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
          <PrimaryButton
            title="See all stays"
            onPress={() => router.push(`/accommodation?attractionId=${attraction.id}`)}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What to do & what it costs</Text>
            <Text style={styles.sectionNote}>Tap to add to your Day Plan</Text>
          </View>
          {attraction.activities.map((act) => {
            const active = isActive(act.id);
            return (
              <TouchableOpacity
                key={act.id}
                style={[styles.activityRow, active && styles.activityRowActive]}
                activeOpacity={0.8}
                onPress={() => handleToggleActivity(act)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName}>{act.name}</Text>
                  {act.note ? <Text style={styles.activityNote}>{act.note}</Text> : null}
                </View>
                <PriceTag amount={act.price} />
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          <SecondaryButton
            title="Go to Day Plan"
            onPress={() => router.push("/day-plan")}
            style={{ marginTop: 20 }}
          />
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
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activityRowActive: { borderColor: colors.clay, backgroundColor: "rgba(201,123,74,0.08)" },
  activityName: { color: colors.charcoal, fontSize: 15, fontWeight: "600" },
  activityNote: { color: "rgba(62,50,38,0.5)", fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(62,50,38,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: colors.clay, borderColor: colors.clay },
  checkmark: { color: colors.ivory, fontWeight: "800", fontSize: 14 },
});
