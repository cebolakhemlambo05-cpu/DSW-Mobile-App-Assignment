import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme/theme";
import { ATTRACTIONS } from "../data/attractions";
import { IconBack, IconGem, IconMapPin } from "../components/Icons";
import { fmt } from "../utils/format";

export default function HiddenGemsScreen({ onBack, onSelect }) {
  const gems = ATTRACTIONS.filter((a) => a.localFav);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Local favourites</Text>
          <Text style={styles.headerTitle}>Hidden Gems</Text>
        </View>
        <IconGem color={colors.sand} size={20} />
      </SafeAreaView>

      <FlatList
        data={gems}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Hand-picked spots loved by South Africans. Fewer tourists, real
            experiences, honest prices.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💎</Text>
            <Text style={styles.emptyTitle}>No local gems yet</Text>
            <Text style={styles.emptySub}>
              Check back soon — we're always adding more.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={styles.card}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.gemBadge}>
                <IconGem color={colors.ivory} size={10} />
                <Text style={styles.gemBadgeText}>Local Fav</Text>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.locationRow}>
                <IconMapPin color={colors.charcoal} size={11} />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>From</Text>
                <Text style={styles.price}>
                  {fmt(Math.min(...item.accommodations.map((a) => a.pricePerNight)))}
                </Text>
                <Text style={styles.priceUnit}>/ night</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 14 },
  intro: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.charcoal,
    opacity: 0.7,
    marginBottom: 4,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.ivory,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  imageWrap: { height: 140 },
  image: { width: "100%", height: "100%" },
  gemBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(122,158,159,0.9)",
  },
  gemBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.ivory,
    letterSpacing: 0.3,
  },
  body: { padding: 14, gap: 6 },
  name: { fontSize: 15, fontFamily: fonts.display, color: colors.charcoal },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 12, color: colors.charcoal, opacity: 0.6 },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  priceLabel: { fontSize: 11, color: colors.charcoal, opacity: 0.5 },
  price: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.savanna },
  priceUnit: { fontSize: 11, color: colors.charcoal, opacity: 0.5 },
  empty: { paddingVertical: 60, alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.charcoal,
  },
  emptySub: {
    fontSize: 13,
    color: colors.charcoal,
    opacity: 0.5,
    marginTop: 6,
    textAlign: "center",
  },
});