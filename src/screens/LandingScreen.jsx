import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import BrandLogo from "../components/BrandLogo";

export default function LandingScreen({ onMode, onPrivacy }) {
  return (
    <View style={styles.screen}>
      <Image source={{ uri: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=1200&h=1800&fit=crop&auto=format" }} style={styles.bg} />
      <View style={styles.veil} />
      <SafeAreaView style={styles.content}>
        <View style={styles.top}>
          <BrandLogo dark />
        </View>
        <View style={styles.main}>
          <View style={styles.copy}>
            <Text style={styles.title}>Plan smarter South African trips.</Text>
            <Text style={styles.body}>Discover attractions, build day plans, check weather, split costs and travel lighter.</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => onMode("login")} style={styles.primary}><Text style={styles.primaryText}>Sign in</Text></Pressable>
            <Pressable onPress={() => onMode("register")} style={styles.secondary}><Text style={styles.secondaryText}>Create account</Text></Pressable>
            <Pressable onPress={onPrivacy} style={styles.privacyBtn}><Text style={styles.link}>Privacy</Text></Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.savanna },
  bg: { ...StyleSheet.absoluteFillObject, opacity: 0.48 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(30,42,32,0.52)" },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  top: {
    position: "absolute",
    top: 28,
    left: 24,
    right: 24,
  },
  main: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: 28,
  },
  copy: { gap: 12, alignItems: "center" },
  title: {
    color: colors.ivory,
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 46,
    textAlign: "center",
    maxWidth: 520,
  },
  body: {
    color: "rgba(250,246,239,0.78)",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 430,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    gap: 10,
  },
  primary: { minHeight: 46, paddingHorizontal: 18, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.terra },
  secondary: { minHeight: 46, paddingHorizontal: 18, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.ivory },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  secondaryText: { color: colors.charcoal, fontFamily: fonts.bodyBold },
  privacyBtn: { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8 },
  link: { color: "rgba(250,246,239,0.72)", textAlign: "center" },
});
