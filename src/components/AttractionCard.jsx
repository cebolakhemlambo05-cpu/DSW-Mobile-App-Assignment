import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, shadows } from "../theme/theme";

export default function AttractionCard({ attraction, onPress }) {
  const cheapest = Math.min(
    ...(attraction.accommodations || []).map((stay) => stay.pricePerNight || 0),
    0
  );
  return (
    <Pressable onPress={onPress} style={[styles.card, shadows.soft]}>
      <Image source={{ uri: attraction.image }} style={styles.image} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.72)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>{attraction.name}</Text>
        <Text numberOfLines={1} style={styles.location}>{attraction.location}</Text>
        <Text style={styles.price}>{cheapest ? `Stays from R${cheapest}` : attraction.category}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 190, borderRadius: 16, overflow: "hidden", backgroundColor: colors.charcoal, marginBottom: 12 },
  image: { width: "100%", height: "100%" },
  content: { position: "absolute", left: 12, right: 12, bottom: 12 },
  name: { color: colors.ivory, fontSize: 16, fontFamily: fonts.display, lineHeight: 19 },
  location: { color: "rgba(250,246,239,0.72)", fontSize: 10, marginTop: 3 },
  price: { color: colors.ivory, fontSize: 11, fontFamily: fonts.bodyBold, marginTop: 8 },
});
