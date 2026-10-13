import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";

export default function AccomCard({ accom, selected, onView, onSelect }) {
  return (
    <Pressable onPress={onView} style={[styles.card, selected && styles.selected]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{accom.name}</Text>
        <Text style={styles.meta}>{accom.type} · {accom.distanceKm ?? 0} km · {accom.rating ?? "4.2"}★</Text>
      </View>
      <Pressable onPress={onSelect} style={[styles.button, selected && styles.buttonSelected]}>
        <Text style={styles.buttonText}>{selected ? "Selected" : fmt(accom.pricePerNight)}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 14, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)" },
  selected: { borderColor: colors.savanna, backgroundColor: "rgba(58,90,64,0.08)" },
  name: { fontFamily: fonts.bodySemiBold, color: colors.charcoal, fontSize: 14 },
  meta: { color: colors.charcoal, opacity: 0.52, fontSize: 11, marginTop: 2 },
  button: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.terra },
  buttonSelected: { backgroundColor: colors.savanna },
  buttonText: { color: colors.ivory, fontFamily: fonts.bodyBold, fontSize: 11 },
});
