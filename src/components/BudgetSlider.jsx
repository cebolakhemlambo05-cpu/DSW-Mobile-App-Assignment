import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";

export default function BudgetSlider({ value, onChange, label = "Budget", sublabel }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>{label}</Text>
          {!!sublabel && <Text style={styles.sub}>{sublabel}</Text>}
        </View>
        <Text style={styles.value}>{fmt(value)}</Text>
      </View>
      <Slider
        minimumValue={500}
        maximumValue={10000}
        step={250}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.terra}
        maximumTrackTintColor="rgba(62,50,38,0.18)"
        thumbTintColor={colors.savanna}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14, backgroundColor: colors.ivory },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.charcoal },
  sub: { fontSize: 10, color: colors.charcoal, opacity: 0.5, marginTop: 2 },
  value: { fontSize: 18, fontFamily: fonts.display, color: colors.savanna },
});
