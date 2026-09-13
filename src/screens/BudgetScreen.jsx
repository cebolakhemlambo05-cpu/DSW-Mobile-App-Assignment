import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { ATTRACTIONS } from "../data/attractions";
import { IconBack, IconWarn, IconCheck } from "../components/Icons";
import BudgetSlider from "../components/BudgetSlider";
import { fmt } from "../utils/format";

export default function BudgetScreen({ plan, onBack, onUpdateBudget }) {
  const [budget, setBudget] = useState(2500);

  const handleChange = (value) => {
    setBudget(value);
    if (onUpdateBudget) onUpdateBudget(value);
  };

  // Compute totals from the day plan
  const lines = plan.map((entry) => {
    const attraction = ATTRACTIONS.find((a) => a.id === entry.attractionId);
    const accomTotal = entry.accommodation?.price ?? 0;
    const activitiesTotal = entry.activities.reduce(
      (s, a) => s + a.price,
      0
    );
    return {
      id: entry.attractionId,
      name: attraction?.name ?? entry.attractionName,
      location: attraction?.location ?? "",
      accomTotal,
      activitiesTotal,
      total: accomTotal + activitiesTotal,
    };
  });

  const grandTotal = lines.reduce((s, l) => s + l.total, 0);
  const remaining = budget - grandTotal;
  const percent =
    budget > 0 ? Math.min(100, Math.round((grandTotal / budget) * 100)) : 0;
  const overBudget = grandTotal > budget;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Track your spending</Text>
          <Text style={styles.headerTitle}>Budget</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BudgetSlider
          value={budget}
          onChange={handleChange}
          label="Daily Budget"
          sublabel="Costs update live as you add items"
        />

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Planned Spending</Text>
            <Text style={styles.progressValue}>{fmt(grandTotal)}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percent}%`,
                  backgroundColor: overBudget ? colors.terra : colors.savanna,
                },
              ]}
            />
          </View>
          <Text style={styles.percentText}>
            {percent}% of daily budget used
          </Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily Budget</Text>
            <Text style={styles.rowValue}>{fmt(budget)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Planned</Text>
            <Text style={styles.rowValue}>{fmt(grandTotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Remaining</Text>
            <Text
              style={[
                styles.rowValue,
                { color: overBudget ? colors.terra : colors.savanna },
              ]}
            >
              {remaining < 0 ? "-" : ""}
              {fmt(Math.abs(remaining))}
            </Text>
          </View>

          <View
            style={[
              styles.statusBox,
              {
                backgroundColor: overBudget
                  ? "rgba(201,123,74,0.12)"
                  : "rgba(58,90,64,0.10)",
              },
            ]}
          >
            {overBudget ? (
              <>
                <IconWarn size={14} />
                <Text style={[styles.statusText, { color: colors.terra }]}>
                  You are {fmt(Math.abs(remaining))} over budget
                </Text>
              </>
            ) : (
              <>
                <IconCheck color={colors.savanna} size={14} />
                <Text style={[styles.statusText, { color: colors.savanna }]}>
                  You are {fmt(remaining)} under budget
                </Text>
              </>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cost Breakdown</Text>

        {lines.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyTitle}>Nothing planned yet</Text>
            <Text style={styles.emptySub}>
              Add attractions to your Day Plan to see how the costs break down.
            </Text>
          </View>
        ) : (
          lines.map((line) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineName}>{line.name}</Text>
                  <Text style={styles.lineLocation}>{line.location}</Text>
                </View>
                <Text style={styles.lineTotal}>{fmt(line.total)}</Text>
              </View>

              {line.accomTotal > 0 && (
                <View style={styles.lineRow}>
                  <Text style={styles.lineRowLabel}>🛏 Accommodation</Text>
                  <Text style={styles.lineRowValue}>
                    {fmt(line.accomTotal)}
                  </Text>
                </View>
              )}

              {line.activitiesTotal > 0 && (
                <View style={styles.lineRow}>
                  <Text style={styles.lineRowLabel}>🎯 Activities</Text>
                  <Text style={styles.lineRowValue}>
                    {fmt(line.activitiesTotal)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.savanna,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(232,220,196,0.6)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.ivory,
  },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  progressCard: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: colors.ivory,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.charcoal,
    opacity: 0.6,
  },
  progressValue: {
    fontSize: 22,
    fontFamily: fonts.display,
    color: colors.charcoal,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(62,50,38,0.08)",
    overflow: "hidden",
    marginTop: 14,
  },
  progressFill: { height: "100%" },
  percentText: {
    fontSize: 11,
    color: colors.charcoal,
    opacity: 0.5,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(62,50,38,0.1)",
    marginVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, color: colors.charcoal, opacity: 0.7 },
  rowValue: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  statusText: { fontSize: 12, fontFamily: fonts.bodySemiBold, flex: 1 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.charcoal,
    opacity: 0.5,
    marginTop: 8,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: colors.ivory,
    borderRadius: 16,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.charcoal,
  },
  emptySub: {
    fontSize: 12,
    color: colors.charcoal,
    opacity: 0.55,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  lineCard: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    padding: 14,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 8,
  },
  lineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(62,50,38,0.08)",
  },
  lineName: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  lineLocation: { fontSize: 11, color: colors.charcoal, opacity: 0.5, marginTop: 2 },
  lineTotal: { fontSize: 16, fontFamily: fonts.display, color: colors.savanna },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  lineRowLabel: { fontSize: 12, color: colors.charcoal, opacity: 0.7 },
  lineRowValue: { fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.charcoal },
});