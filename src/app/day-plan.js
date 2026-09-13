import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import PriceTag from "../components/PriceTag";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../constants/colors";
import { useDayPlan } from "../context/DayPlanContext";

export default function DayPlanScreen() {
  const { attractionName, selectedStay, selectedActivities, total, clearPlan, toggleActivity } =
    useDayPlan();

  const isEmpty = !selectedStay && selectedActivities.length === 0;

  const handleClear = () => {
    Alert.alert("Clear day plan?", "This will remove your selected stay and activities.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearPlan },
    ]);
  };

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Day Plan</Text>
        {attractionName ? (
          <Text style={styles.subtitle}>{attractionName}</Text>
        ) : (
          <Text style={styles.subtitle}>Nothing planned yet</Text>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No plan yet</Text>
          <Text style={styles.emptyText}>
            Browse an attraction and add a stay or activities to build your day plan.
          </Text>
          <PrimaryButton title="Browse attractions" onPress={() => router.push("/home")} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            {selectedStay && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stay</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{selectedStay.name}</Text>
                    <Text style={styles.rowNote}>{selectedStay.distanceKm}km from gate</Text>
                  </View>
                  <PriceTag amount={selectedStay.price} unit="/night" />
                </View>
              </View>
            )}

            {selectedActivities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activities</Text>
                {selectedActivities.map((act) => (
                  <View key={act.id} style={styles.row}>
                    <Text style={styles.rowName}>{act.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <PriceTag amount={act.price} />
                      <TouchableOpacity onPress={() => toggleActivity(act)}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <PriceTag amount={total} size="large" />
            </View>
            <PrimaryButton title="Browse more attractions" onPress={() => router.push("/home")} />
            <TouchableOpacity onPress={handleClear} style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={styles.clearText}>Clear day plan</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backLink: { color: colors.savanna, fontSize: 15, fontWeight: "600" },
  title: { color: colors.charcoal, fontSize: 26, fontWeight: "800", marginTop: 12 },
  subtitle: { color: "rgba(62,50,38,0.6)", fontSize: 13, marginTop: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: colors.charcoal, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptyText: { color: "rgba(62,50,38,0.6)", fontSize: 14, textAlign: "center", lineHeight: 20 },
  list: { paddingHorizontal: 24, paddingBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { color: "rgba(62,50,38,0.6)", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  rowName: { color: colors.charcoal, fontSize: 15, fontWeight: "600" },
  rowNote: { color: "rgba(62,50,38,0.5)", fontSize: 12, marginTop: 2 },
  removeText: { color: colors.clay, fontSize: 12, fontWeight: "700" },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(62,50,38,0.1)",
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  totalLabel: { color: colors.charcoal, fontSize: 16, fontWeight: "700" },
  clearText: { color: "rgba(62,50,38,0.5)", fontSize: 13, fontWeight: "600" },
});
