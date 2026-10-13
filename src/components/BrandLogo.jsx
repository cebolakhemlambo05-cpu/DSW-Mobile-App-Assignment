import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "../theme/theme";

const logoSource = require("../../data/images/logo.png");

export default function BrandLogo({ dark = false, compact = false, circle = false, rounded = false }) {
  return (
    <View style={[styles.wrap, compact && styles.compactWrap, circle && styles.circleWrap, rounded && styles.roundedWrap, dark && styles.darkWrap]}>
      <Image
        source={logoSource}
        resizeMode="contain"
        accessible
        accessibilityLabel="All In One Planner logo"
        style={[styles.image, rounded && styles.roundedImage]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 148, height: 96, overflow: "hidden", borderRadius: 18, backgroundColor: colors.ivory, shadowColor: colors.charcoal, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  darkWrap: { borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  compactWrap: { width: 86, height: 56, borderRadius: 10, shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  circleWrap: { width: 48, height: 48, borderRadius: 24, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  roundedWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  image: { width: "100%", height: "100%" },
  roundedImage: { width: 66, height: 66 },
});
