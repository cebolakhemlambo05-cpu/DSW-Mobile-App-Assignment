import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";
import { attractions } from "../data/attractions";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const filtered = attractions.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.blurb.toLowerCase().includes(q)
    );
  });

  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <View style={styles.header}>
        <Text style={styles.title}>Where to next?</Text>
        <Text style={styles.subtitle}>
          Try "wildlife", "mountains", or "nightlife"
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Search attractions..."
          placeholderTextColor="rgba(62,50,38,0.4)"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 && (
          <Text style={styles.empty}>No matches — try a different search.</Text>
        )}
        {filtered.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/attraction/${a.id}`)}
          >
            <Image source={{ uri: a.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{a.name}</Text>
              <Text style={styles.cardCategory}>{a.category}</Text>
              <Text style={styles.cardBlurb}>{a.blurb}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  title: { color: colors.charcoal, fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { color: "rgba(62,50,38,0.6)", fontSize: 13, marginBottom: 16 },
  input: {
    backgroundColor: colors.ivory,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.12)",
  },
  list: { paddingHorizontal: 24, paddingBottom: 40, gap: 14 },
  empty: { color: "rgba(62,50,38,0.5)", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: colors.ivory,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 130 },
  cardBody: { padding: 14 },
  cardTitle: { color: colors.charcoal, fontSize: 17, fontWeight: "700" },
  cardCategory: { color: colors.skyBlue, fontSize: 12, fontWeight: "700", marginTop: 2 },
  cardBlurb: { color: "rgba(62,50,38,0.7)", fontSize: 13, marginTop: 6, lineHeight: 18 },
});
