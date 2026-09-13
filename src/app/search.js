import React from "react";
import { Text, StyleSheet } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import { colors } from "../constants/colors";

export default function SearchScreen() {
  return (
    <ScreenContainer backgroundColor={colors.sand}>
      <Text style={styles.text}>Search — coming soon</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  text: { flex: 1, color: colors.charcoal, fontSize: 16, fontWeight: "600", textAlign: "center", textAlignVertical: "center" },
});
