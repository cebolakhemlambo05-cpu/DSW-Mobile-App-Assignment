import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors } from "../constants/colors";

const features = [
  { icon: "💰", text: "Budget slider filters out what you can't afford" },
  { icon: "📍", text: "Distance shown to attraction gate, not city centre" },
  { icon: "💎", text: "Hidden gems rated by South African locals" },
  { icon: "👥", text: "Group cost split in one tap" },
];

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(58,90,64,0.9)",
          "rgba(58,90,64,0.55)",
          "rgba(62,50,38,0.35)",
          "rgba(62,50,38,0.94)",
        ]}
        locations={[0, 0.28, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={{ fontSize: 16 }}>🏠</Text>
            </View>
            <Text style={styles.brandLabel}>All-in-one planner</Text>
          </View>

          <Text style={styles.headline}>
            Plan South Africa.{"\n"}
            <Text style={styles.headlineAccent}>
              Prices first, surprises never.
            </Text>
          </Text>

          <Text style={styles.subhead}>
            Budget-first travel planning — attractions, stays, and
            activities, all in one place. See every rand before you book.
          </Text>

          <View style={styles.featureList}>
            {features.map((f, i) => (
              <View style={styles.featureRow} key={i}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/create-account")}
          >
            <Text style={styles.primaryButtonText}>Create a free account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            South Africa travel planning · Free forever
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.savanna },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.clay,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLabel: { color: colors.ivory, fontWeight: "700", fontSize: 13, letterSpacing: 0.8 },
  headline: { color: colors.ivory, fontSize: 32, lineHeight: 38, fontWeight: "800", marginBottom: 14 },
  headlineAccent: { color: colors.mustard },
  subhead: { color: "rgba(250,246,239,0.85)", fontSize: 15, lineHeight: 21, marginBottom: 24, maxWidth: 340 },
  featureList: { gap: 10, marginBottom: "auto" },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(62,50,38,0.55)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureIcon: { fontSize: 18 },
  featureText: { color: colors.ivory, fontSize: 14, lineHeight: 19, flex: 1 },
  primaryButton: { marginTop: 28, backgroundColor: colors.clay, borderRadius: 28, paddingVertical: 16, alignItems: "center" },
  primaryButtonText: { color: colors.ivory, fontSize: 16, fontWeight: "700" },
  secondaryButton: { marginTop: 12, borderRadius: 28, borderWidth: 1.5, borderColor: "rgba(250,246,239,0.6)", paddingVertical: 16, alignItems: "center" },
  secondaryButtonText: { color: colors.ivory, fontSize: 16, fontWeight: "700" },
  footer: { marginTop: 18, textAlign: "center", color: "rgba(250,246,239,0.6)", fontSize: 12 },
});
