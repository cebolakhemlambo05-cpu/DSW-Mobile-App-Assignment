import React from "react";
import { Modal, View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";

export default function AccomDetailModal({ visible, accom, onClose, onSelect, isSelected }) {
  if (!accom) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Image source={{ uri: accom.details?.image }} style={styles.image} />
          <Text style={styles.name}>{accom.name}</Text>
          <Text style={styles.body}>{accom.details?.description || accom.type}</Text>
          <Text style={styles.meta}>{accom.details?.address || "South Africa"}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondary}><Text style={styles.secondaryText}>Close</Text></Pressable>
            <Pressable onPress={onSelect} style={styles.primary}><Text style={styles.primaryText}>{isSelected ? "Selected" : `Select ${fmt(accom.pricePerNight)}`}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.ivory, gap: 10 },
  image: { height: 150, borderRadius: 16, backgroundColor: colors.sand },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.charcoal },
  body: { color: colors.charcoal, opacity: 0.72, lineHeight: 20 },
  meta: { color: colors.charcoal, opacity: 0.52, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  secondary: { flex: 1, padding: 13, alignItems: "center", borderRadius: 14, backgroundColor: colors.sand },
  primary: { flex: 1.4, padding: 13, alignItems: "center", borderRadius: 14, backgroundColor: colors.savanna },
  secondaryText: { fontFamily: fonts.bodyBold, color: colors.charcoal },
  primaryText: { fontFamily: fonts.bodyBold, color: colors.ivory },
});
