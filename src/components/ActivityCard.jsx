import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";

export default function ActivityCard({ activity, selected, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={[styles.card, selected && styles.selected]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{activity.name}</Text>
        <Text style={styles.meta}>{activity.duration || "Flexible"} · per person</Text>
      </View>
      <Text style={styles.price}>{fmt(activity.pricePerPerson)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 13, borderRadius: 14, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)" },
  selected: { borderColor: colors.sky, backgroundColor: "rgba(111,159,163,0.12)" },
  name: { fontFamily: fonts.bodySemiBold, color: colors.charcoal, fontSize: 14 },
  meta: { color: colors.charcoal, opacity: 0.52, fontSize: 11, marginTop: 2 },
  price: { color: colors.savanna, fontFamily: fonts.bodyBold, fontSize: 13 },
});
