import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { colors } from "../constants/colors";

const MAX_CONTENT_WIDTH = 430;

export default function ScreenContainer({ children, backgroundColor }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width > MAX_CONTENT_WIDTH;

  return (
    <View style={[styles.page, isWide && styles.pageWide]}>
      <View
        style={[
          styles.frame,
          isWide && styles.frameWide,
          backgroundColor && { backgroundColor },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  pageWide: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    flex: 1,
    width: "100%",
  },
  frameWide: {
    flex: 0,
    width: MAX_CONTENT_WIDTH,
    height: "100vh",
    maxHeight: 900,
    borderRadius: 24,
    overflow: "hidden",
  },
});
